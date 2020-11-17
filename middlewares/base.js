const _      = require("lodash");

class BaseMiddleware {
    static onError(error, context) {
        error       = _.isObject(error) ? error : {};
        context     = !!context ? context : BaseMiddleware.onError.name;
        error.reqid = context;
        console.log(error);
    }

    static onUncaughtException(error) {
        BaseMiddleware.onError(error, BaseMiddleware.onUncaughtException.name);
    }

    static onUnhandledRejection(error) {
        BaseMiddleware.onError(error, BaseMiddleware.onUnhandledRejection.name);
    }
}

module.exports = BaseMiddleware;