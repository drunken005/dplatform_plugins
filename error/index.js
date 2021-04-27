const CodeStateEnum             = require("../enums/code_state");
const SubCodeStateEnum          = require("../enums/sub_code_state");
const SuccessSubCodeMessageEnum = require("../enums/success_sub_code_message");
const CommonSubCodeMessageEnum  = require("../enums/common_sub_code_message");
const HttpSubCodeMessageEnum    = require("../enums/http_sub_code_message");
const _                         = require("lodash");

class MyException extends Error {
    constructor(respCode, subCode, msg, detail) {
        if (_.isError(detail)) {
            msg += detail.message;
        } else if (_.isString(detail)) {
            msg += detail;
        }
        super(msg);
        this.respCode = respCode;
        this.subCode  = subCode;
        this.msg      = msg;
    }

    getReturnData(data) {
        return {
            "respCode": this.respCode,
            "data":     !!data ? data : {},
            "msg":      this.msg,
            "sub_code": this.subCode,
            "success":  this.respCode === CodeStateEnum.SUCCESS.value,
        };
    }

    static isSuccess(response) {
        let successFlag = false;
        if (response && response.respCode === CodeStateEnum.SUCCESS.value) {
            successFlag = true;
        }

        return successFlag;
    }

    toString() {
        return `respCode=${this.respCode}||sub_code=${this.subCode}||msg=${this.msg}`;
    }
}


class Success extends MyException {
    constructor(detail) {
        super(CodeStateEnum.SUCCESS.value, SubCodeStateEnum.ONE.value, ``, detail);
    }
}


class Fail extends MyException {
    constructor(detail) {
        super(CodeStateEnum.COMMON.value, SubCodeStateEnum.TWO.value, ``, detail);
    }
}


class InvalidParameter extends MyException {
    constructor(detail) {
        super(CodeStateEnum.COMMON.value, SubCodeStateEnum.ONE.value, ``, detail);
    }
}


class ItemNotFound extends MyException {
    constructor(detail) {
        super(CodeStateEnum.COMMON.value, SubCodeStateEnum.TWO.value, ``, detail);
    }
}


class MySQLException extends MyException {
    constructor(detail) {
        super(CodeStateEnum.COMMON.value, SubCodeStateEnum.THREE.value, ``, detail);
    }
}


class TooManyRequests extends MyException {
    constructor(detail) {
        super(CodeStateEnum.COMMON.value, SubCodeStateEnum.FIVE.value, ``, detail);
    }
}


class ItemMisMatched extends MyException {
    constructor(detail) {
        super(CodeStateEnum.COMMON.value, SubCodeStateEnum.SIX.value, ``, detail);
    }
}


class UncaughtException extends MyException {
    constructor(detail) {
        super(CodeStateEnum.COMMON.value, SubCodeStateEnum.TEN.value, ``, detail);
    }
}


class NetworkTimeout extends MyException {
    constructor(detail) {
        super(CodeStateEnum.HTTP.value, SubCodeStateEnum.ONE.value, ``, detail);
    }
}


class HttpUncaughtException extends MyException {
    constructor(detail) {
        super(CodeStateEnum.HTTP.value, SubCodeStateEnum.TEN.value, ``, detail);
    }
}


module.exports = {
    MyException,
    Success,
    Fail,
    InvalidParameter,
    ItemNotFound,
    MySQLException,
    TooManyRequests,
    ItemMisMatched,
    UncaughtException,
    NetworkTimeout,
    HttpUncaughtException,
};
