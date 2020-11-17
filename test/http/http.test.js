const assert                                         = require("assert");
const _                                              = require("lodash");
const logger                                         = require("dplatform-logger")();
const {Http, Parameter, EurekaStorage, errors}       = require("../../");
const {HTTP_CONNECTION, EUREKA_SERVICE, WALLET_APIS} = require("../constant");
const {MyException}                                  = errors;

describe("Http.plugin", async function () {
    it("request()", async function () {
        this.timeout(HTTP_CONNECTION.TIMEOUT);

        let options        = EurekaStorage.getTarget(EUREKA_SERVICE.WALLET, WALLET_APIS.ACCOUNT_BALANCE);
        let requestOptions = _.assign({}, options, {
            body:    {
                address:  "0x91C8cBC45D759AE6a826FC434a04b6B7C4Fdd339",
                chain:    "eth",
                currency: "eth",
            },
            headers: HTTP_CONNECTION.HEADERS,
            timeout: HTTP_CONNECTION.TIMEOUT || options.timeout,
        });

        let response = await Http.request(new Parameter(), requestOptions, logger);
        assert.ok(MyException.isSuccess(response));
        assert.ok(response.hasOwnProperty("data"));
        assert.ok(response.data.hasOwnProperty("amount"));
        assert.ok(response.hasOwnProperty("traceId"));
        assert.ok(response.hasOwnProperty("success"));
        assert.ok(response.success);
    });
});