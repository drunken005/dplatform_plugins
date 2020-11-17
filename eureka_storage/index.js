const _          = require("lodash");
const Utils      = require("../utils");
const strategies = require("../strategies");

const createStrategy = (strategy, endpointUrls) => {
    const Strategy = strategies[strategy];
    return new Strategy(endpointUrls);
};

let eurekaStorage = null;

class EurekaStorage {
    constructor() {
        this.eurekaServices = {};
    }

    /**
     *
     * @param eurekaService 设置Apollo配置的Eureka在注册中心的注册信息
     * @param currentService 设置当前服务在Apollo配置的基本信息
     */
    addService(eurekaService, currentService) {
        currentService.eurekaServices = currentService.eurekaServices || {};
        _.each(eurekaService, (urls, _service) => {
            const strategy                = urls.length > 1 ? "round-robin" : "static";
            this.eurekaServices[_service] = createStrategy(strategy, urls);
        });
        this.service = currentService;
    }

    /**
     * Get Eureka cache and implementation load balance
     * @param eurekaName
     * @param path
     * @returns {{method: *, json: boolean, uri: *, timeout: *}|{method: *, json: boolean, uri: *, timeout: *}}
     */
    getTarget(eurekaName, path) {
        if (!eurekaName) {
            throw new Error(` The Eureka service name was not specified.`);
        }
        if(!this.service){
            throw new Error(` Eureka storage not cache eurekas. please check.`);
        }
        let eurekaServices = this.service.eurekaServices;
        if (!eurekaServices) {
            throw new Error(` Eureka storage not cache eurekas. please check.`);
        }
        let _eureka = eurekaServices[eurekaName.toLowerCase()];
        if (!_eureka) {
            throw new Error(` Get eureka '${eurekaName.toUpperCase()}' fail. msg=Not find eureka service`);
        }
        let balancer = this.eurekaServices[_eureka.toLowerCase()];
        if (!balancer) {
            throw new Error(` Get eureka '${_eureka.toUpperCase()}' fail. msg=Not find eureka service`);
        }
        let target = balancer.nextTarget();
        target.uri = Utils.urlMerge(target.uri, path);
        return target;
    }
}

if (!eurekaStorage) {
    eurekaStorage = new EurekaStorage();
}

module.exports = eurekaStorage;
