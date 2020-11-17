const assert     = require("assert");
const {Identifier} = require("../../");

describe("Identifier.plugin", () => {
    let identifier;
    it("constructor()", function () {
        try {
            identifier = new Identifier();
        } catch (e) {
            assert.strictEqual(e.message, "Invalid params chain: undefined, currency: undefined");
        }
        identifier = new Identifier("ETH", "usDt");

        assert.strictEqual(identifier.chain, "eth");
        assert.strictEqual(identifier.currency, "usdt");
    });

    it("toString()", function () {
        assert.strictEqual(identifier.toString(), "eth|TOKEN");
    });

    it("headers()", function () {
        let headers = identifier.headers();
        assert.strictEqual(headers.chain, "eth");
        assert.strictEqual(headers.currency, "usdt");
    });

    it("export()", function () {
        const _export = identifier.export();
        assert.strictEqual(_export.chain, "eth");
        assert.strictEqual(_export.currency, "usdt");
        assert.ok(_export.isToken);
    });
});