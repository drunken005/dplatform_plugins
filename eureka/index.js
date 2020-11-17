const {Eureka}      = require("eureka-js-client");
const _             = require("lodash");
const Apollo        = require("../apollo");
const Util          = require("../utils");
const EurekaStorage = require("../eureka_storage");

let _eurekaApps = {};

class EurekaClient {
    constructor(options) {
        options                 = Util.checkEurekaOptions(options);
        this.eurekaServicesKeys = _.map(options.eurekaServices, (_value, _key) => _value.toLowerCase()) || [];
        this.serviceName        = options.name;
        this.logger             = options.logger;
        const _eureka           = {eureka: options.eureka};

        if (!!options.registerWithEureka) {
            if (!options.port) {
                throw new Error("Eureka client register failed, service.port is invalid.");
            }
            this.instanceId  = Util.createEurekaInstanceId(options);
            let hostName     = Util.getIpv4();
            _eureka.instance = {
                metadata:       {},
                app:            options.name,
                hostName:       hostName,
                ipAddr:         hostName,
                port:           {
                    "$":        options.port,
                    "@enabled": "true",
                },
                instanceId:     this.instanceId || options.name,
                vipAddress:     options.name,
                statusPageUrl:  `http://${hostName}:${options.port}/report/health`,
                healthCheckUrl: `http://${hostName}:${options.port}/report/health`,
                homePageUrl:    `http://${hostName}:${options.port}/report/health`,
                dataCenterInfo: {
                    "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
                    name:     "MyOwn",
                },
            };
        } else {
            _eureka.eureka.registerWithEureka    = false;
            _eureka.eureka.registryFetchInterval = 10000;
        }
        this._client = new Eureka(_.assign(_eureka, {logger: options.logger}));
        this._client.on("registryUpdated", this.onUpdate.bind(this));
    }

    start() {
        this._client.start();
    }

    stop() {
        this._client.stop();
        let eureka = this._client.config.eureka;
        if (_.isEmpty(this._client.config.instance)) {
            this.logger.info(`stopped connection eureka with ${eureka.host}:${eureka.port}`);
        } else {
            this.logger.info(`stopped with eureka: =${this.serviceName}/${this.instanceId}`);
        }

    }

    /**
     * Listening Eureka service status
     * @returns {Promise<void|*>}
     */
    async onUpdate() {
        let currentService      = Apollo.get(this.serviceName);
        currentService          = _.pick(currentService, ["eurekaServices", "name"]);
        this.eurekaServicesKeys = _.map(currentService.eurekaServices || {}, (_value, _key) => _value.toLowerCase()) || [];
        let apps                = this._client.cache.app;
        let eurekaServices      = this.serviceHandler(apps);
        if (_.isEmpty(_eurekaApps)) {
            _eurekaApps = eurekaServices;
            EurekaStorage.addService(eurekaServices, currentService);
            this.logger.info(`Loading and cache eureka services : ${JSON.stringify(_.keys(_eurekaApps)).toUpperCase()}`);
        }
        let isChange = !_.isEqual(eurekaServices, _eurekaApps);
        if (isChange) {
            this.compareEurekaServices(eurekaServices);
            _eurekaApps = eurekaServices;
            EurekaStorage.addService(eurekaServices, currentService);
        }
    }

    /**
     * 比较Eureka监听的服务列表和缓存到服务列表状态，打印移除或者新增服务配置信息
     * @param newServices
     */
    compareEurekaServices(newServices) {
        const currentArrays = _.map(_eurekaApps, (value, key) => `${key}~${value.join(",")}`);
        const newArrays     = _.map(newServices, (value, key) => `${key}~${value.join(",")}`);
        const _generateObj  = (arrays) => {
            let obj = {};
            _.each(arrays, (item) => {
                obj[item.split("~")[0]] = item.split("~")[1].split(",");
            });
            return obj;
        };

        const _compare  = (compare, compareTo) => {
            let differences = [];
            _.each(compare, (value, key) => {
                if (compareTo[key] && compareTo[key].length) {
                    let _difference = _.difference(value, compareTo[key]);
                    if (_difference.length) {
                        differences.push(`[${key.toUpperCase()}](${_difference.join(",")})`);
                    }
                } else {
                    differences.push(`[${key.toUpperCase()}](${value.join(",")})`);
                }
            });
            return differences.join("; ");
        };
        const removeObj = _generateObj(_.difference(currentArrays, newArrays));
        const addObj    = _generateObj(_.difference(newArrays, currentArrays));
        const remove    = _compare(removeObj, addObj); //'Remove services: ' +
        const add       = _compare(addObj, removeObj);

        let logs = [];
        if (remove.length)
            logs.push("Remove eureka services: " + remove);
        if (add.length)
            logs.push("Add eureka services: " + add);

        this.logger.info(`${logs.join(" and ")}`);
    }

    /**
     * 处理服务 返回由应用名称及路径组成的对象
     * @param  {[type]} services [description]
     * @return {[Array]}          [description]
     */
    serviceHandler(services) {
        let apps = {};
        if (_.isNil(services)) return apps;
        let _this = this;
        _.forEach(services, (instances, appId) => {
            if (!_this.eurekaServicesKeys || !_this.eurekaServicesKeys.length) {
                let _service = _this.instanceHandler(instances);
                !_.isEmpty(_service) && (apps[appId.toLowerCase()] = _service);
            } else if (_.includes(_this.eurekaServicesKeys, appId.toLowerCase())) {
                let _service = _this.instanceHandler(instances);
                !_.isEmpty(_service) && (apps[appId.toLowerCase()] = _service);
            }

        });
        return apps;
    }

    /**
     * 处理实例数组，将实例信息转为路径
     * @param  {[Array]} instances [description]
     * @return {[Array]}           [description]
     */
    instanceHandler(instances) {
        let services = [];
        if (_.isNil(instances)) return services;
        let _this = this;
        _.forEach(instances, (instance, key) => {
            let _service = _this.getServerPath(instance);
            !_.isNil(_service) && services.push(_service);
        });
        return services;
    }

    /**
     * 根据实例获取一个完整的IP方式的服务地址
     * @param  {[Object]} instance [description]
     */
    getServerPath(instance) {
        if (!instance)
            return null;
        if (_.has(instance, "securePort") && instance.securePort["@enabled"] === "true") {
            return `https://${instance.ipAddr}:${instance.port["$"]}`;
        }
        if (_.has(instance, "port") && instance.port["@enabled"] === "true") {
            return `http://${instance.ipAddr}:${instance.port["$"]}`;
        }
        return null;
    }


    /**
     * 使用eureka 注册名称获取eureka缓存配置
     * @param serviceName
     * @returns {null|*}
     */
    static getEurekaService(serviceName) {
        if (!serviceName) {
            return null;
        }
        return _eurekaApps[serviceName.toLowerCase()];
    }
}

module.exports = EurekaClient;