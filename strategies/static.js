const HttpMethodEnum = require("../enums/http_method");

module.exports = class StaticProxy {
    constructor(endpoints) {
        this.endpoints = endpoints;
        this.target    = this.endpoints[0];
    }

    nextTarget() {
        return {
            method:  HttpMethodEnum.POST.key,
            uri:     this.target,
            json:    true,
            timeout: 10 * 1000,
        };
    }
};
