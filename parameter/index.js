const Util = require("../utils");

/**
 * 请求参数类
 */
class Parameter {
    constructor(reqid) {
        this.reqid = !!reqid ? reqid : Util.uuid();
    }

    export() {
        return {
            reqid: this.reqid,
        };
    }

    static fromTraceId(traceId) {
        let parameter = new Parameter(traceId);

        return parameter.export();
    }

    static fromParameter(parameter) {
        let __parameter__ = new Parameter();
        let traceId       = `${parameter && parameter.reqid}_${__parameter__.reqid}`;

        return Parameter.fromTraceId(traceId);
    }
}

module.exports = Parameter;