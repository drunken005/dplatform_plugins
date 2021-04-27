const apollo  = require("ctrip-apollo");
const moment  = require("moment-timezone");
const _       = require("lodash");
const rebuild = require("./rebuild");
const Util    = require("../utils");
const Kms     = require("../kms");

let _config = {};

const KMS_DECRYPT_KEYS = ["mongo.password", "mysql.password", "db.password", "redis.password"];

class Apollo {

    /**
     * 初始化 apollo 读取配置
     * @returns {Promise<void>}
     */
    static async init(options) {
        let kms                           = new Kms();
        const {logger, options: _options} = Util.checkApolloOptions(options);
        logger.info(">>>>>>>>> Init apollo and loading config       >>>>>>>>>");
        const _namespace = apollo(_options).cluster(_options.cluster).namespace(_options.namespace);
        const _ready     = await _namespace.ready();
        _config          = _ready.config();
        for (let _key of KMS_DECRYPT_KEYS) {
            if (!!_config[_key]) {
                _config[_key] = await kms.decrypt(_config[_key]);
            }
        }
        Apollo._setNodeEnv(_config, null, logger);
        _namespace.on("change", async (options) => {
            _config[options.key] = options.newValue;
            Apollo._setNodeEnv(options, "Change", logger);
        });

        _namespace.on("add", async (options) => {
            _config[options.key] = options.value;
            Apollo._setNodeEnv(options, "Add", logger);
        });

        _namespace.on("delete", async (options) => {
            delete _config[options.key];
            Apollo._setNodeEnv(options, "Delete", logger);
        });

        let redis = _config.redis;
        if (!!redis) {
            redis      = JSON.parse(redis);
            let _redis = [];
            for (let _doc of redis) {
                if (_doc.password) {
                    _doc.password = await kms.decrypt(_doc.password);
                }
                _redis.push(_doc);
            }
            _config.redis = JSON.stringify(_redis);
        }
        logger.info("<<<<<<<<< Init apollo and loading config  done <<<<<<<<<\n");
    }

    /**
     * 根据Apollo配置设置环境变量
     * @param options
     * @param event
     */
    static _setNodeEnv(options, event, logger) {
        if (!event && options.node_env) {
            process.env.NODE_ENV = options.node_env;
            return logger.info(`Current NODE_ENV=${process.env.NODE_ENV}`);
        }
        if (options.key !== "node_env" || !event) {
            return;
        }
        if (event.toLowerCase() === "change") {
            process.env.NODE_ENV = options.newValue;
            return logger.info(`Change NODE_ENV=${process.env.NODE_ENV}`);
        }
        if (event.toLowerCase() === "add" && options.value) {
            process.env.NODE_ENV = options.value;
            return logger.info(`Reset NODE_ENV=${process.env.NODE_ENV}`);
        }

        if (event.toLowerCase() === "delete") {
            delete process.env.NODE_ENV;
            return logger.info(`Delete NODE_ENV, NODE_ENV=${process.env.NODE_ENV}`);
        }
    }

    static get(key) {
        let cache = rebuild(_config);
        if (cache[key]) {
            let data = cache[key];
            if (!_.isObject(data)) {
                return Util.isJsonString(data) ? JSON.parse(data) : data;
            }

            _.each(data, (v, k) => {
                if (Util.isJsonString(v)) {
                    data[k] = JSON.parse(v);
                }
            });
            return data;
        }
        let res = _config[key];
        return Util.isJsonString(res) ? JSON.parse(res) : res;
    }

    static getMysqlConnection() {
        let db              = Apollo.get("db");
        db.options.logging  = db.logging ? require("../logger")().sql : db.logging;
        db.options.timezone = moment().format("Z");
        let uri             = `mysql://${db.username}:${db.password}@${db.host}:${db.port}/${db.name}`;
        uri                 = uri.replace(/%/g, "%25");
        delete _config["db.password"];
        return [uri, db.options];
    }
}

module.exports = Apollo;
