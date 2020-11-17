const assert            = require("assert");
const {Parameter, Util} = require("../../");

describe("Parameter.plugin", function () {
    let parameter;
    let uid = Util.uuid();
    it("constructor()", function () {
        parameter = new Parameter();
        assert.ok(parameter.hasOwnProperty("reqid"));
        assert.strictEqual(typeof parameter.reqid, "string");


        parameter = new Parameter(uid);
        assert.strictEqual(typeof parameter.reqid, "string");
        assert.strictEqual(parameter.reqid, uid);
    });

    it("export()", function () {
        const _export = parameter.export();
        assert.ok(_export.hasOwnProperty("reqid"));
        assert.strictEqual(_export.reqid, uid);
    });

    it("fromTraceId()", function () {
        let uid2         = Util.uuid();
        const parameter2 = Parameter.fromTraceId(uid2);
        assert.ok(parameter2.hasOwnProperty("reqid"));
        assert.strictEqual(parameter2.reqid, uid2);
    });

    it("fromParameter()", function () {
        const parameter3 = Parameter.fromParameter(parameter);
        assert.ok(parameter3.hasOwnProperty("reqid"));
        assert.strictEqual(parameter3.reqid.split("_").length, 2);
        assert.strictEqual(parameter3.reqid.split("_")[0], uid);
    });
});