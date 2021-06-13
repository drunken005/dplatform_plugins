const rp                                      = require("request-promise");
const _                                       = require("lodash");
const Parameter                               = require("../parameter");
const Util                                    = require("../utils");
const {HttpUncaughtException, NetworkTimeout} = require("../error");


/**
 * 通用HTTP调用类
 */
class Http {
    static async request(parameter, options, logger = console, hideLog) {
        const startTime = Date.now();
        const {reqid}   = Parameter.fromParameter(parameter);
        const method    = options.method;

        try {
            let request = {
                reqid,
                method:  options.method,
                uri:     options.uri,
                headers: options.headers,
                params:  options.body,
                msg:     "http request begin...",
            };
            // if (!Util.hiddenLog) {
            //     request.headers = options.headers;
            //     request.params  = options.body;
            // }
            logger.info(request);


            let result = await rp(options);


            let cost = Date.now() - startTime;

            let _response = {
                reqid,
                method:   options.method,
                uri:      options.uri,
                headers:  options.headers,
                response: hideLog ? `${JSON.stringify(result)}` : "-----",
                cost:     `${cost}ms`,
                msg:      `http response end.`,
            };

            // if (!Util.hiddenLog) {
            //     _response.headers  = options.headers;
            //     _response.response = result;
            // }
            logger.info(_response);

            return result;
        } catch (error) {
            error            = _.isObject(error) ? error : {};
            error.reqid      = `${reqid}||HttpConnection.request(parameter, options)`;
            let ErrorHandler = error.message === "Error: ETIMEDOUT" ? NetworkTimeout : HttpUncaughtException;

            let cost     = Date.now() - startTime;
            let response = {
                reqid,
                method,
                body: "HttpConnection.request(parameter, options)",
                cost: `${cost}ms`,
                msg:  "http response err.",
            };
            logger.stack(error);
            logger.info(response);
            throw new ErrorHandler(error.message);
        }
    }
}


module.exports = Http;
