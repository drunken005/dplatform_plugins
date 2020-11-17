const assert    = require("assert");
const {BigNumber} = require("../../");

describe("BigNumber.plugin", () => {

    it("toWei()", () => {
        let number = "1.2";
        let res    = BigNumber.toWei(number);
        assert.strictEqual(res.length, 31);
    });

    it("fromWei()", function () {
        let number = "1200000000000000000000000000000";
        let res    = BigNumber.fromWei(number);
        assert.strictEqual(res.length, 3);
        assert.strictEqual(res, "1.2");
    });

    it("toEtherWei()", () => {
        let number = "1.2";
        let res    = BigNumber.toEtherWei(number);
        assert.strictEqual(res.length, 19);
    });

    it("fromWei()", function () {
        let number = "1200000000000000000";
        let res    = BigNumber.fromEtherWei(number);
        assert.strictEqual(res.length, 3);
        assert.strictEqual(res, "1.2");
    });

    it("add()", function () {
        assert.strictEqual(BigNumber.add("0.000000000001", "0.0000000000021", "0.0000000000002"), "0.0000000000033");
        assert.strictEqual(BigNumber.add("12.0000212", "8.0000111", "11.0000007"), "31.000033");
        assert.strictEqual(BigNumber.add("2000", null, "20000"), "22000");
    });

    it("mul()", function () {
        assert.strictEqual(BigNumber.mul("111", "222"), "24642");
        assert.strictEqual(BigNumber.mul("0.000001", "0.00002"), "0.00000000002");
        assert.strictEqual(BigNumber.mul("2.33001", "5.000089"), "11.65025737089");

    });

    it("sub()", function () {
        assert.strictEqual(BigNumber.sub("0.00000000003", "0.0000000000021", "0.0000000000002"), "0.0000000000277");
        assert.strictEqual(BigNumber.sub("12.0000212", "8.0000111", "11.0000007"), "-6.9999906");
        assert.strictEqual(BigNumber.sub("2000", null, "20000"), "-18000");
    });


});