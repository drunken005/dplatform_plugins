const assert                 = require("assert");
const logger                 = require("dplatform-logger")();
const {Apollo, EurekaClient} = require("../../");
const {APP}                  = require("../constant");


describe("Eureka.plugin", () => {
    let eureka;
    before(() => {
        const service = Apollo.get(APP.SERVER_NAME);
        const option  = {
            ...service,
            logger,
            name:   APP.SERVER_NAME,
            eureka: Apollo.get("eureka"),
        };
        eureka        = new EurekaClient(option);
        eureka.start();
    });

    it("Constructor()", function () {
        assert.ok(!!eureka);
        assert.strictEqual(eureka.serviceName, APP.SERVER_NAME);
        assert.ok(eureka.eurekaServicesKeys.length > 0);

    });
    it("eurekaConfig", function () {
        const _client = eureka._client.config.eureka;
        const _eureka = Apollo.get("eureka");

        assert.strictEqual(_client.port, _eureka.port);
        assert.strictEqual(_client.host, _eureka.host);
        assert.strictEqual(_client.servicePath, _eureka.servicePath);
        assert.strictEqual(_client.registerWithEureka, false);
    });
});