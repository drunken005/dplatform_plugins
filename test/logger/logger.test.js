const assert = require("assert");
const path   = require("path");
const logger = require("dplatform-logger")();
const {APP}  = require("../constant");

describe("Logger.plugin", () => {

    it("logger.info ", function () {
        assert.strictEqual(typeof logger.debug, "function");
        assert.strictEqual(typeof logger.info, "function");
        assert.strictEqual(typeof logger.warn, "function");
        assert.strictEqual(typeof logger.error, "function");
        assert.strictEqual(typeof logger.stack, "function");
        assert.strictEqual(typeof logger.transaction, "function");
        assert.strictEqual(typeof logger.sql, "function");
        assert.strictEqual(typeof logger.in, "function");
        assert.strictEqual(typeof logger.out, "function");
        assert.strictEqual(typeof logger.alarm, "function");
    });

    it("logger.logDir", function () {
        let dir = path.join(path.resolve("."), "log", APP.SERVER_NAME);
        assert.strictEqual(logger.logDir, dir);
        assert.strictEqual(logger.serviceName, APP.SERVER_NAME);
    });

    it("logger.monitorLogDir", function () {
        let monitorLogDir = path.join(path.resolve("."), "log");
        assert.strictEqual(logger.monitorLogDir, monitorLogDir);
    });

    it("logger.daysToKeep", function () {
        assert.strictEqual(logger.daysToKeep, 5);
    });
});