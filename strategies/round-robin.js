const HttpMethodEnum = require("../enums/http_method");

module.exports = class RoundRobin {
    constructor(endpoints) {
        this.endpoints        = endpoints;
        this.endpointIndex    = 0;
        this.endpointMaxIndex = this.endpoints.length - 1;
    }

    nextTarget() {
        let target = this.endpoints[this.endpointIndex++];
        if (this.endpointIndex > this.endpointMaxIndex) {
            this.endpointIndex = 0;
        }
        return {
            method:  HttpMethodEnum.POST.key,
            uri:     target,
            json:    true,
            timeout: 10 * 1000,
        };
    }
};
