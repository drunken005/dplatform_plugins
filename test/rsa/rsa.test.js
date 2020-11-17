const Rsa     = require("../../rsa");
const assert  = require("assert");
const KeyPair = require("./keyPair.js");

describe("Rsa.plugin", () => {
    let rsa;
    const data = {
        name:    "rsa",
        version: "1.1.1",
    };
    let signatureData;

    it("constructor()", function () {
        rsa = new Rsa(KeyPair.privateKey);
    });

    it("sign()", function () {
        signatureData = rsa.sign(Rsa.sortParamsToJson(data));
        assert.ok(!!signatureData);
        assert.strictEqual(typeof signatureData, "string");
    });

    it("verify()", function () {
        let verify = rsa.verify(JSON.stringify(data), signatureData);
        assert.ok(verify);
    });

    it("export()", function () {
        let _export = rsa.export();
        assert.ok(_export.hasOwnProperty("privateKey"));
        assert.ok(_export.hasOwnProperty("publicKey"));
        // assert.strictEqual(_export.privateKey, KeyPair.privateKey);
        // assert.strictEqual(_export.publicKey, KeyPair.publicKey);
    });
});