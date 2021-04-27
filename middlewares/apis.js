const KoaBodyParser                                      = require("koa-bodyparser");
const _                                                  = require("lodash");
const {RateLimit}                                        = require("koa2-ratelimit");
const Parameter                                          = require("../parameter");
const Util                                               = require("../utils");
const {MyException, UncaughtException, InvalidParameter} = require("../error");
const BaseMiddleware                                     = require("./base");


class ApiMiddleware extends BaseMiddleware {
    static __before_request_handler__(ctx) {
        ctx.state.parameter = Parameter.fromTraceId(ctx.headers["x-b3-traceid"]);
        ctx.state.startTime = Date.now();

        let request = {
            reqid:   ctx.state.parameter.reqid,
            method:  ctx.method,
            url:     ctx.url,
            headers: ctx.headers,
            params:  ctx.request.body,
            ip:      ctx.request.ip,
            msg:     "A request begin...",
        };

        // if (!Util.hiddenLog) {
        //     request.headers = ctx.headers;
        //     request.params  = ctx.request.body;
        // }
        ctx.logger.in(request);
    }

    static __after_response_handler__(ctx) {
        let cost = Date.now() - ctx.state.startTime;
        ctx.set("x-b3-traceid", ctx.state.parameter.reqid);
        ctx.set("x-response-time", `${cost}ms`);
        ctx.type = ctx.type || "application/json";

        let response = {
            reqid:    ctx.state.parameter.reqid,
            method:   ctx.method,
            url:      ctx.url,
            headers:  JSON.stringify(ctx.response.headers),
            response: ctx.type === "application/json" ? ctx.body : "***",
            cost,
            msg:      "A response end.\n",
        };
        // if (!Util.hiddenLog) {
        //     response.headers  = JSON.stringify(ctx.response.headers);
        //     response.response = ctx.body;
        // }
        ctx.logger.out(response);
    }

    static __run_exception_handler__(error, ctx) {
        if (!(error instanceof MyException)) {
            error = new UncaughtException(error && error.message);
        }
        ctx.body = error.getReturnData();
    }

    static onBodyParserError(error, ctx) {
        ApiMiddleware.__before_request_handler__(ctx);
        ctx.body = new InvalidParameter(error && error.message).getReturnData();
        ApiMiddleware.onError(error, ApiMiddleware.onBodyParserError.name);
        ApiMiddleware.__after_response_handler__(ctx);
    }

    static onAppError(error, ctx) {
        ApiMiddleware.__run_exception_handler__(error, ctx);
    }

    static LoggerHandler(logger) {
        return async (ctx, next) => {
            logger     = logger || require("dplatform-logger")();
            ctx.logger = logger;
            await next();
        };
    }

    static ApiLimiter({rateLimitMin, rateLimitMax}) {
        return RateLimit.middleware({
            interval: {
                min: rateLimitMin,
            },
            max:      rateLimitMax,
        });
    }

    static BodyParser() {
        return KoaBodyParser({
            onerror: ApiMiddleware.onBodyParserError,
        });
    }

    static async onMessage(ctx, next) {
        try {
            ApiMiddleware.__before_request_handler__(ctx);
            await next();
        } catch (error) {
            error       = _.isObject(error) ? error : {};
            error.reqid = ctx.state.parameter ? ctx.state.parameter.reqid : `ApiMiddleware.${ApiMiddleware.onMessage.name}()`;
            ctx.logger.stack(error);
            ApiMiddleware.__run_exception_handler__(error, ctx);
        }
        ApiMiddleware.__after_response_handler__(ctx);
    }
}


process.on("uncaughtException", ApiMiddleware.onUncaughtException);
process.on("unhandledRejection", ApiMiddleware.onUnhandledRejection);


module.exports = ApiMiddleware;