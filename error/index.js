const _ = require("lodash");

let errorTypes = [], errorMap = {}, errCodeMap = {};
let SUCCESS_CODE                               = "000000",
    SUCCESS_SUB_CODE                           = "000",
    STEP                                       = 100000,
    SUB_STEP                                   = 100,
    NAMING_RULE                                = /[A-Z]\w+/,
    SUB_NAMING_RULE                            = /[A-Z]\w+(\.[A-Z]\w+)+/,
    checkErrType                               = function (errorType, isSubType) {
        if (errorTypes.indexOf(errorType) >= 0) {
            throw new Error("duplicate errorType \"" + errorType + "\".");
        }
        if (!(isSubType ? SUB_NAMING_RULE : NAMING_RULE).test(errorType)) {
            throw new Error(`errorType ${errorType} is not UpperCamelCase style.`);
        }
    },
    registerErrSpace                           = function (ctx, currentSpace, errorType, subSpace = 0) {
        errorTypes.push(errorType);
        ctx._currentSpace        = ctx.errorSpace = ctx.errorCode = currentSpace;
        ctx._subSpace            = subSpace;
        ctx.errorType            = errorType;
        errCodeMap[currentSpace] = errorMap[errorType] = ctx;
    },
    isErrTypeIns;
let currentSpace                               = 0;

class _SubErrorType {
    constructor(parent, errorType) {
        errorType = [parent.errorType, errorType].join(".");
        checkErrType(errorType, true);
        parent._currentSpace += SUB_STEP;
        parent._subSpace += SUB_STEP;
        registerErrSpace(this, parent._currentSpace, errorType, parent._subSpace);
    }
}

class ErrorType {
    constructor(errorType) {
        checkErrType(errorType);

        registerErrSpace(this, currentSpace, errorType);
        currentSpace += STEP;
    }

    SubErrorTypeFactory(errorType) {
        return new _SubErrorType(this, errorType);
    }
}

isErrTypeIns = function (ins) {
    return ins instanceof ErrorType;
};

[_SubErrorType, ErrorType].forEach(function (clazz) {
    _.extend(clazz.prototype, {
        getErrorMsg(errKey) {
            let isName = _.isString(errKey);
            return this[isName ? "_spaceConfigs" : "_spaceIndexes"][errKey];
        },

        configErrorSpace(messages) {
            let self = this;
            if (messages.length > SUB_STEP) {
                throw new Error("expect an array with length not greater than " + SUB_STEP);
            }

            let configs = self._spaceConfigs = {};
            let indexes = self._spaceIndexes = [];

            messages.forEach(function (msg) {
                let {index, name} = msg;
                if (configs[name] || indexes[index]) {
                    throw new Error(`duplicate ${configs[name] ? "name" : "index"} on ${self.errorType}.${name}`);
                }
                if (index < 0 || index >= SUB_STEP) {
                    throw new Error(`${self.errorType}.${name} has an index out of range (0~${SUB_STEP - 1}).`);
                }
                indexes[index] = configs[name] = msg;
            });
        },
    });
});

let getErrorTypeInstance = function (errorType) {
    let errTypeIsString = _.isString(errorType);
    if (!errTypeIsString && !isErrTypeIns(errorType)) {
        throw new Error("errorType must be string type or ErrorType instance.");
    }

    if (errTypeIsString) {
        let _errorType = errorMap[errorType];
        if (!_errorType) {
            throw new Error("errorType \"" +
                errorType +
                "\" is not registered. If you want a sub ErrorType instance, " +
                "you should pass the errorType as \"Parent.Son\" format.");
        }
        errorType = _errorType;
    }
    return errorType;
};

class DoraError extends Error {
    /**
     * @constructor
     * @param errorCode {!number}
     * @param errorType {!String}
     * @param reason {?string=}
     * @param details {?object=}
     * @param subCode {!number}
     */
    constructor(errorCode, errorType, reason, details, subCode) {
        super(errorType, reason, details);

        if (!details && !_.isString(reason)) {
            [reason, details] = [null, reason];
        }
        let self = this;
        // Ensure we get a proper stack trace in most Javascript environments
        if (Error.captureStackTrace) {
            // V8 environments (Chrome and Node.js)
            Error.captureStackTrace(self, DoraError);
        } else {
            // Borrow the .stack property of a native Error object.
            self.stack = new Error().stack;
        }
        self.errorType = errorType;
        self.reason    = reason;
        self.error     = errorCode;
        self.details   = self.details || details;
        self.subCode   = subCode;

        if (self.reason) {
            self.message = self.reason + " [" + self.error + "]";
        } else {
            self.message = "[" + self.error + "]";
        }
    }

    static configs(config) {
        if (!config) {
            return {
                STEP,
                SUB_STEP,
                NAMING_RULE,
                SUB_NAMING_RULE,
                SUCCESS_CODE,
                SUCCESS_SUB_CODE,
            };
        }

        STEP             = config.STEP || STEP;
        SUB_STEP         = config.SUB_STEP || SUB_STEP;
        NAMING_RULE      = config.NAMING_RULE || NAMING_RULE;
        SUB_NAMING_RULE  = config.SUB_NAMING_RULE || SUB_NAMING_RULE;
        SUCCESS_CODE     = config.SUCCESS_CODE || SUCCESS_CODE;
        SUCCESS_SUB_CODE = config.SUCCESS_SUB_CODE || SUCCESS_SUB_CODE;
    }

    static DoraErrorClassFactory(errorType, messages) {
        let isSubType  = /\./.test(errorType);
        let relations  = isSubType && errorType.match(/^(\w+)\.([\w\.]+)/).slice(1);
        let errTypeIns = isSubType ?
            DoraError.SubErrorTypeFactory(...relations) :
            DoraError.ErrorTypeFactory(errorType);

        errorType = errTypeIns.errorType;
        messages && errTypeIns.configErrorSpace(messages);

        let fac = function (errorType, reason, details) {
            if (!details && !_.isString(reason)) {
                [reason, details] = [null, reason];
            }

            let self     = {};
            let {errKey} = errorType;

            if (errKey >= SUB_STEP || errKey < 0) {
                throw new TypeError("offset cannot less greater than or equal to" + SUB_STEP + ", or less than 0.");
            }
            self.errorType = errorType.errorType;
            self.reason    = errorType.getErrorMsg(errKey);
            if (_.isObject(self.reason)) {
                errKey      = self.reason.index;
                self.errorType += "." + self.reason.name;
                self.reason = self.reason.message;
                if (_.isFunction(self.reason)) {
                    self.reason = self.reason(details && details.msgParams);
                }
            }
            self.reason = reason || self.reason;
            if (_.isString(errKey)) {
                throw new Error(`error key ${errKey} is not defined.`);
            }
            self.error   = errorType.errorCode + errKey;
            self.subCode = errorType._subSpace + errKey;
            if (details) {
                self.details = _.isObject(details) ? _.omit(details, "msgParams") : details;
            }

            return self;
        };

        class Err extends DoraError {
            constructor(errKey, reason, details) {
                let proto = fac(_.extend(errTypeIns, {errKey: errKey = errKey || 0}), reason, details);
                super(proto.error, proto.errorType, proto.reason, proto.details, proto.subCode);
            }
        }

        let ins   = DoraError;
        relations = relations || [errorType];
        relations.slice(0, -1).forEach(function (errType) {
            ins = ins[errType];
        });

        return ins[relations[relations.length - 1]] = Err;
    }

    static ErrorTypeFactory(name) {
        return new ErrorType(name);
    }

    static SubErrorTypeFactory(parent, name) {
        parent = getErrorTypeInstance(parent);
        return parent[name.replace(parent.errorType + ".", "")] = parent.SubErrorTypeFactory(name);
    }

    static getErrorType(name) {
        return getErrorTypeInstance(name);
    }

    static isDoraErrorInstance(ins) {
        return ins instanceof DoraError ||
            ins.error >= STEP && DoraError.getErrorType(ins.errorType.replace(/(\.[_a-z][\w\-]+)+$/, ""));
    }

    static isSuccess(response) {
        let successFlag = false;
        if (response && response.respCode === SUCCESS_CODE) {
            successFlag = true;
        }
        return successFlag;
    }

    toJSON() {
        return {
            respCode: this.error ? this.error.toString() : SUCCESS_CODE,
            errorType: this.errorType,
            detail:    this.details,
            msg:      this.reason || "",
            sub_code: this.subCode ? this.subCode.toString() : SUCCESS_SUB_CODE,
            success:  this.error === 0,

        };
    }

    getReturnData(data) {
        return {
            respCode: this.error ? this.error.toString() : SUCCESS_CODE,
            data:     !!data ? data : {},
            msg:      this.reason || "",
            sub_code: this.subCode ? this.subCode.toString() : SUCCESS_SUB_CODE,
            success:  this.error === 0
        };
    }
}

let factory = function (configs, parentName) {
    let errMap = {};

    _.each(configs, function (config, name) {
        config = _.isArray(config) ? {messages: config} : config;

        config.messages = config.messages.map(messageObj => {
            if (messageObj.message && messageObj.message.params && messageObj.message.func) {
                let {params, func} = messageObj.message;
                messageObj.message = function (args) {
                    let pattern       = /\$\{(\d+)\}/g;
                    pattern.lastIndex = 0;
                    let result;
                    let idx           = 0;
                    while ((result = pattern.exec(func)) !== null && (_.isUndefined(params) || idx < params)) {
                        func = func.replace(/\$\{(\d+)\}/, args[result[1]]);
                        idx++;
                    }
                    return func;
                };
            }

            return messageObj;
        });

        let ErrClass = DoraError.DoraErrorClassFactory((parentName ? (parentName + ".") : "") + name, config.messages);
        if (!parentName) {
            errMap[name] = ErrClass;
        }
        config.children && _.each(config.children, function (child, key) {
            factory({[key]: child}, name);
        });
    });

    return errMap;
};

module.exports = {
    ErrClass: DoraError,
    factory,
};
