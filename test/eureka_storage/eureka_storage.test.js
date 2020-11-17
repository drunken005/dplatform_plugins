const assert                                         = require("assert");
const {Apollo, Util, EurekaStorage}                  = require("../../");
const {WALLET_APIS, EUREKA_SERVICE, HTTP_CONNECTION} = require("../constant");

describe("EurekaStorage.plugin", async function () {
    it("getTarget", async function () {
        this.timeout(3100);
        await Util.sleep(3000);
        const options = EurekaStorage.getTarget(EUREKA_SERVICE.WALLET, WALLET_APIS.ACCOUNT_BALANCE);
        assert.strictEqual(options.method, "POST");
        assert.ok(options.json);
        assert.strictEqual(options.timeout, HTTP_CONNECTION.TIMEOUT);
        assert.ok(options.hasOwnProperty("uri"));
    });
});