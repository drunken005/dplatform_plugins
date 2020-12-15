const os                 = require("os");
const _                  = require("lodash");
const {v4: uuidV4}       = require("uuid");
const FlakeId            = require("flake-idgen");
const NumberFormat       = require("biguint-format");
const Path               = require("path");
const Crypto             = require("crypto");
const {InvalidParameter} = require("../error");
const Identifier         = require("../identifier");

const sequenceProduce = new FlakeId();

const precisions = [
    {
        currency:  "eth",
        precision: 10,
    },
    {
        currency:  "usdt",
        precision: 4,
    },
    {
        currency:  "feth",
        precision: 10,
    },
    {
        currency:  "fusdt",
        precision: 4,
    },
    {
        currency:  "ieth",
        precision: 10,
    },
    {
        currency:  "iusdt",
        precision: 4,
    },
    {
        currency:  "trx",
        precision: 6,
    },
    {
        currency:  "cny",
        precision: 2,
    },
];

class Util {

    static async sleep(ms) {
        return new Promise(function (resolve) {
            setTimeout(resolve, ms);
        });
    };

    static uuid() {
        return uuidV4().replace(/-/g, "").substr(0, 16);
    }

    static getBizId() {
        return NumberFormat(sequenceProduce.next(), "dec");
    }

    static isJsonString(str) {
        let _res = true;
        try {
            JSON.parse(str);
        } catch (e) {
            _res = false;
        }
        return _res;
    }

    static urlMerge() {
        const params = Array.prototype.slice.apply(arguments);
        const _split = "://";
        if (!params || !params.length)
            return null;

        if (params.length <= 1)
            return params[0];

        const existsProtocol = params[0].split(_split);

        if (existsProtocol.length <= 1)
            return Path.join(...params);

        const paths    = params.slice(1, params.length);
        const protocol = existsProtocol[0];
        const origin   = existsProtocol.slice(-1).toString();
        return protocol.concat(_split).concat(Path.join(origin, ...paths));
    }

    static createEurekaInstanceId(service) {
        // return [Util.getIpv4().replace(/\./g, '-'), service.name, service.port].join(':')
        return [Util.getIpv4(), service.name, service.port].join(":");
    }

    static getIpv4() {
        let networkInterfaces = os.networkInterfaces();
        let nets              = networkInterfaces.en0 ? networkInterfaces.en0 : networkInterfaces.eth0;
        nets                  = nets ? nets : networkInterfaces.ens224;
        let {address}         = _.find(nets, {family: "IPv4"});
        return address;
    }

    static filterURLPassword(input) {
        const index = input.indexOf("@");
        if (index === -1) return input;
        const startIndex = input.lastIndexOf(":", index);
        return input.substring(0, startIndex + 1) + "******" + input.substring(index);
    }

    static endCode(data, encoding = "hex") {
        if (!data) {
            return data;
        }
        if (_.isString(data)) {
            return Buffer.from(data).toString(encoding);
        }
        return Buffer.from(JSON.stringify(data)).toString(encoding);
    }

    static deCode(str, encoding = "hex") {
        return Buffer.from(str, encoding).toString();
    }

    /**
     * 对json对象key首字母排序，返回拼接字符串
     * @param params
     * @returns {string}
     */
    static sortParams(params) {
        _.each(params, (value, key) => {
            (value === "" || value === undefined || value === null) && delete data[key];
        });
        let keys  = _.sortBy(_.keys(params));
        let _docs = _.map(keys, (key) => {
            return [key, params[key]].join("=");
        });
        return _docs.join("&");
    }

    /**
     * 对json对象key首字母进行排序返回新的对象
     * @param params
     * @returns {*}
     */
    static sortParamsToObj(params) {
        let keys = _.sortBy(_.keys(params));
        let obj  = {};
        _.each(keys, (key) => {
            if (params[key] != null) {
                obj[key] = params[key];
            }
        });
        return obj;
    }

    static md5Encrypt(str) {
        return Crypto.createHash("md5").update(str).digest("hex");
    }

    static get hiddenLog() {
        const NODE_ENV = process.env.NODE_ENV;
        if (!NODE_ENV) return true;
        return _.includes(["pre", "production", "prod", "undefined", undefined], NODE_ENV);
    }

    static getMonthWeek(a, b, c) {
        /**
         * a = d = 当前日期
         * b = 6 - w = 当前周的还有几天过完(不算今天)
         * a + b 的和在除以7 就是当天是当前月份的第几周
         */
        let date = new Date(a, parseInt(b) - 1, c),
            w    = date.getDay(),
            d    = date.getDate();
        if (w === 0) {
            w = 7;
        }
        return {
            year:  date.getFullYear(),
            month: date.getMonth() + 1,
            week:  Math.ceil((d + 6 - w) / 7),
        };
    }

    /**
     * time 格式必须是 2020052610
     * @param time
     */
    static formatTime(time) {
        let year  = time.substring(0, 4);
        let month = time.substring(4, 6);
        let day   = time.substring(6, 8);
        let hour  = time.substring(8, 10);
        let week  = Util.getMonthWeek(year, month, day).week.toString();
        return {
            year,
            month,
            week,
            day,
            hour,
        };
    }

    static formatTimeToString(time) {
        time      = time.toString();
        let year  = time.substring(0, 4);
        let month = time.substring(4, 6);
        let day   = time.substring(6, 8);
        let hour  = time.substring(8, 10);
        return [year, month, day].join("-") + " " + hour;
    }

    static ethAddressFormat(address) {
        if (!address) {
            throw new InvalidParameter("Address cannot be empty.");
        }
        return address.toLowerCase();
    }

    static formatChainCurrency(data, addressKey) {
        let identifier = new Identifier(data.chain, data.currency);
        data           = _.extend(data, _.pick(identifier.export(), ["chain", "currency"]));
        if (_.includes(["eth", "ieth", "feth"], identifier.chain)) {
            if (_.isArray(addressKey)) {
                _.each(addressKey, (item) => {
                    data[item] && (data[item] = Util.ethAddressFormat(data[item]));
                });
            }
            if (_.isString(addressKey)) {
                data[addressKey] && (data[addressKey] = Util.ethAddressFormat(data[addressKey]));
            }
        }
        return data;
    }

    static processNumberPrecision(doc, key = "amount", currency) {
        let data = _.cloneDeep(doc);
        if (!data.hasOwnProperty(key)) {
            return data;
        }
        let _currency = currency || data.currency;
        if (!_currency) {
            return data;
        }

        if (_.isNaN(Number(data[key]))) {
            throw new InvalidParameter(`The amount type must be either a number or a string type number. data.${key}=${data[key]}`);
        }

        let precision = _.find(precisions, {currency: _currency.toLowerCase()});
        if (!precision) {
            return data;
        }

        data[key] = data[key] ? data[key].toString() : "0";
        let docs  = data[key].split(".");
        if (docs.length === 1) {
            return data;
        }
        const integer = docs[0];
        const decimal = docs[1];
        data[key]     = [integer, decimal.substr(0, precision.precision)].join(".");
        return data;
    }

    static processNumberPrecisionKeys(doc, keys = ["amount"], currency) {
        let data = _.cloneDeep(doc);
        if (!keys || !_.isArray(keys) || !keys.length) {
            return data;
        }
        let _currency = currency || data.currency;
        if (!_currency) {
            return data;
        }

        for (let i = 0; i <= keys.length; i++) {
            let key = keys[i];
            if (!data.hasOwnProperty(key)) {
                continue;
            }
            if (_.isNaN(Number(data[key]))) {
                continue;
            }
            let precision = _.find(precisions, {currency: _currency.toLowerCase()});
            if (!precision) {
                continue;
            }
            data[key] = data[key] ? data[key].toString() : "0";
            let docs  = data[key].split(".");
            if (docs.length === 1) {
                continue;
            }
            const integer = docs[0];
            const decimal = docs[1];
            data[key]     = [integer, decimal.substr(0, precision.precision)].join(".");
        }
        return data;
    }

    static processAmountPrecision(doc, key) {
        let data    = _.cloneDeep(doc);
        key         = key || "amount";
        let residue = "0";
        if (!data.hasOwnProperty("currency") || !data.hasOwnProperty(key)) {
            return data;
        }
        if (_.isNaN(Number(data[key]))) {
            throw new InvalidParameter(`The amount type must be either a number or a string type number. data.amount=${data[key]}`);
        }
        let identifier = new Identifier(data.chain, data.currency);
        let precision  = _.find(precisions, {currency: identifier.currency});
        if (!precision) {
            return data;
        }
        data[key] = data[key].toString();
        let docs  = data[key].split(".");
        if (docs.length === 1) {
            return data;
        }

        const integer = docs[0];
        const decimal = docs[1];
        data[key]     = [integer, decimal.substr(0, precision.precision)].join(".");

        let _residue = decimal.substr(precision.precision);
        if (_residue) {
            for (let i = 1; i < precision.precision; i++) {
                residue += "0";
            }
            data.residue = ["0.", residue, _residue].join("");
        }
        return data;
    }

    static apolloOption(defaultOptions) {
        const host    = process.env["apollo_meta"];
        const cluster = process.env["apollo_cluster"];
        if (!host || !cluster) {
            throw new Error(`The environment variable configuration for APOLLO was not found.`);
        }
        return _.assign({}, defaultOptions, {
            host,
            cluster,
        });
    }

    static kmsOptions() {
        const accessKeyId     = process.env["kms_accessKeyId"];
        const accessKeySecret = process.env["kms_secret"];
        let endpoint          = process.env["kms_regionId"];
        if (endpoint) {
            endpoint = `kms.${endpoint}.aliyuncs.com`;
        }
        delete process.env.kms_accessKeyId;
        delete process.env.kms_secret;
        delete process.env.kms_regionId;
        return Util.checkKmsOptions({
            endpoint,
            accessKeyId,
            accessKeySecret,
        });
    }

    static checkEurekaOptions(options) {
        let keys       = ["name", "port", "logger", "eurekaServices", "registerWithEureka", "eureka"];
        let eurekaKeys = ["host", "port", "servicePath"];
        const _default = {
            logger:             console,
            eurekaServices:     {},
            registerWithEureka: false,
        };
        options        = _.assign({}, _default, _.pick(options, keys));
        if (!options.registerWithEureka) {
            _.remove(keys, (k) => k === "port");
        }

        let missKeys = [];
        _.each(keys, (_key) => {
            if (!options.hasOwnProperty(_key)) {
                missKeys.push(_key);
            }
        });
        if (missKeys.length) {
            throw new InvalidParameter(`Eureka client init error, options is invalid. missing key: '${missKeys.join(", ")}'`);
        }

        let eurekaMissKeys = [];

        _.each(eurekaKeys, (_key) => {
            if (!options.eureka.hasOwnProperty(_key)) {
                eurekaMissKeys.push(_key);
            }
        });
        if (eurekaMissKeys.length) {
            throw new InvalidParameter(`Eureka client init error, options.eureka is invalid. missing key: '${eurekaMissKeys.join(", ")}'`);
        }
        return options;
    }

    static checkApolloOptions(options) {
        const keys   = ["namespace", "cluster", "appId", "host"];
        let missKeys = [];
        _.each(keys, (_key) => {
            if (!options.hasOwnProperty(_key) || !options[_key]) {
                missKeys.push(_key);
            }
        });
        if (missKeys.length) {
            throw new InvalidParameter(`Apollo init error, options is invalid. missing key: '${missKeys.join(", ")}'`);
        }
        const logger = options.logger || console;
        options      = _.pick(options, keys);
        return {
            options,
            logger,
        };
    }

    static checkKmsOptions(options) {
        const keys   = ["endpoint", "accessKeyId", "accessKeySecret"];
        let missKeys = [];
        _.each(keys, (_key) => {
            if (!options.hasOwnProperty(_key) || !options[_key]) {
                missKeys.push(_key);
            }
        });
        if (missKeys.length) {
            throw new InvalidParameter(`Kms init error, options is invalid. missing key: '${missKeys.join(", ")}'`);
        }
        return _.pick(options, keys);
    }
}

module.exports = Util;