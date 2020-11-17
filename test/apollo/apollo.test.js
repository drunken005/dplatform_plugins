const assert = require("assert");
const _      = require("lodash");
const {APP}  = require("../constant");
const {Apollo} = require("../../");

describe("Apollo.plugin", function () {

    it("get()", function () {
        let app = Apollo.get(APP.SERVER_NAME);
        assert.ok(app.hasOwnProperty("port"));
        assert.ok(app.hasOwnProperty("host"));
        assert.ok(app.hasOwnProperty("eurekaServices"));

        let eureka = Apollo.get('eureka');
        assert.ok(eureka.hasOwnProperty("port"));
        assert.ok(eureka.hasOwnProperty("host"));
        assert.ok(eureka.hasOwnProperty("servicePath"));
    });

    it("getMysqlConnection()", function () {
        let mysqlInfo = Apollo.getMysqlConnection();
        assert.strictEqual(mysqlInfo.length, 2);
        assert.strictEqual(typeof mysqlInfo[0], 'string');
    });
});