const KoaBodyParser  = require("koa-bodyparser");
const _              = require("lodash");
const {RateLimit}    = require("koa2-ratelimit");
const Parameter      = require("../parameter");
const BaseMiddleware = require("./base");


class ApiMiddleware extends BaseMiddleware {

    static _mask_request(ctx) {
        let params  = {};
        let headers = _.cloneDeep(ctx.headers);
        if (ctx.headers["content-type"] === "application/json") {
            params = _.cloneDeep(ctx.request.body);
            _.each(params, (v, k) => {
                if (_.includes(["password", "token", "verifyCode"], k)) {
                    params[k] = "****";
                }
            });
        }
        _.each(headers, (v, k) => {
            if (k.indexOf("token") >= 0) {
                headers[k] = `${v.slice(0, 4)}***`;
            }
        });

        return {
            params,
            headers,
        };
    }

    static _mask_response(ctx) {
        let response = {};
        if (ctx.type === "application/json") {
            response = _.cloneDeep(ctx.body);
            if (response && response.data && _.isObject(response.data)) {
                _.each(response.data, (v, k) => {
                    if (_.includes(["password", "token", "verifyCode"], k)) {
                        response.data[k] = `${v.slice(0, 4)}***`;
                    }
                });
            }

        }
        return response;
    }

    static __before_request_handler__(ctx) {
        ctx.state.parameter     = Parameter.fromTraceId(ctx.headers["x-b3-traceid"]);
        ctx.state.startTime     = Date.now();
        const {params, headers} = ApiMiddleware._mask_request(ctx);
        let request             = {
            reqid:   ctx.state.parameter.reqid,
            method:  ctx.method,
            url:     ctx.url,
            headers: headers,
            params:  params,
            ip:      ctx.request.ip,
            msg:     "A request begin...",
        };
        ctx.logger.in(request);
    }

    static __after_response_handler__(ctx) {
        let cost = Date.now() - ctx.state.startTime;
        ctx.set("x-b3-traceid", ctx.state.parameter.reqid);
        ctx.set("x-response-time", `${cost}ms`);
        ctx.type     = ctx.type || "application/json";
        let response = {
            reqid:    ctx.state.parameter.reqid,
            method:   ctx.method,
            url:      ctx.url,
            headers:  JSON.stringify(ctx.response.headers),
            response: ApiMiddleware._mask_response(ctx),
            cost,
            msg:      "A response end.\n",
        };
        ctx.logger.out(response);
    }

    static __run_exception_handler__(error, ctx) {
        if (!ctx.error.isDoraErrorInstance(error)) {
            error = new ctx.error.SystemErr("uncaught-error", error && error.message, "uncaught error");
        }
        ctx.body = error.getReturnData();
    }

    static onBodyParserError(error, ctx) {
        ApiMiddleware.__before_request_handler__(ctx);
        ctx.body = new ctx.ParamsErr("post-data-error", error && error.message, "post data error").getReturnData();
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

    static ErrorHandler(error) {
        return async (ctx, next) => {
            ctx.error = error;
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