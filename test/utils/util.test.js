const assert                   = require("assert");
const _                        = require("lodash");
const {Util}                   = require("../../");
const logger                   = require("dplatform-logger")();
const {APOLLO_DEFAULT_OPTIONS} = require("../constant");

describe("Util.plugin", () => {
    it("uuid()", function () {
        const _uid = Util.uuid();
        assert.strictEqual(typeof _uid, "string");
        assert.strictEqual(_uid.length, 16);
    });

    it("getBizId()", function () {
        const bizId = Util.getBizId();
        assert.strictEqual(typeof bizId, "string");
        assert.strictEqual(bizId.length, 19);
    });

    it("isJsonString()", function () {
        let res = Util.isJsonString("false");
        assert.ok(res);
        res = Util.isJsonString("21");
        assert.ok(res);
        res = Util.isJsonString("{\"name\":\"drunken\"}");
        assert.ok(res);
        res = Util.isJsonString("\"name\":\"drunken\"}");
        assert.ok(!res);
    });

    it("urlMerge()", function () {
        const url   = "https://www.google.com/";
        const url2  = "https://127.0.0.1:8080";
        const path  = "/search?name=2";
        const path2 = "search/name=2";
        assert.strictEqual(Util.urlMerge(url, path), "https://www.google.com/search?name=2");
        assert.strictEqual(Util.urlMerge(url, path2), "https://www.google.com/search/name=2");
        assert.strictEqual(Util.urlMerge(url2, path2), "https://127.0.0.1:8080/search/name=2");
    });

    it("createEurekaInstanceId", function () {
        const res = Util.createEurekaInstanceId({
            name: "test",
            port: 8080,
        });
        assert.strictEqual(res.split(":").length, 3);
    });

    it("getIpv4", function () {
        const res = Util.getIpv4();
        assert.strictEqual(res.split(".").length, 4);
    });

    it("filterURLPassword", function () {
        const res = Util.filterURLPassword(`mysql://name:password@host:3306/dbname`);
        assert.strictEqual(res, "mysql://name:******@host:3306/dbname");
    });

    it("endCode", function () {
        const res  = Util.endCode({
            name: "test",
            port: 8080,
        });
        const res2 = Util.endCode({
            name: "test",
            port: 8080,
        }, "base64");
        assert.strictEqual(res, "7b226e616d65223a2274657374222c22706f7274223a383038307d");
        assert.strictEqual(res2, "eyJuYW1lIjoidGVzdCIsInBvcnQiOjgwODB9");

    });

    it("deCode", function () {
        const str  = "7b226e616d65223a2274657374222c22706f7274223a383038307d";
        const str2 = "eyJuYW1lIjoidGVzdCIsInBvcnQiOjgwODB9";
        const data = {
            "name": "test",
            "port": 8080,
        };
        assert.strictEqual(Util.deCode(str), JSON.stringify(data));
        assert.strictEqual(Util.deCode(str2, "base64"), JSON.stringify(data));
    });


    it("sortParams", function () {
        const data = {
            name:    "test",
            port:    8080,
            age:     20,
            collate: "zzzz",
            body:    "ok",
        };
        const res  = Util.sortParams(data);
        assert.strictEqual(res.split("&").length, 5);
        assert.strictEqual(res.split("=").length, 6);
        assert.ok(!Util.isJsonString(res));
        assert.strictEqual(res, "age=20&body=ok&collate=zzzz&name=test&port=8080");
    });

    it("sortParamsToObj", function () {
        const data = {
            name:    "test",
            port:    8080,
            age:     20,
            collate: "zzzz",
            body:    "ok",
        };
        const res  = Util.sortParamsToObj(data);
        assert.strictEqual(_.keys(res)[0], "age");
        assert.strictEqual(_.keys(res)[2], "collate");
    });

    it("md5Encrypt", function () {
        const data = {
            name:    "test",
            port:    8080,
            age:     20,
            collate: "zzzz",
            body:    "ok",
        };
        const res  = Util.md5Encrypt(JSON.stringify(data));
        assert.strictEqual(res, "07ae7f6e41ec3557be40118e79443f3a");
    });

    it("hiddenLog", function () {
        process.env.NODE_ENV = "pre";
        assert.ok(Util.hiddenLog);

        process.env.NODE_ENV = "test";
        assert.ok(!Util.hiddenLog);

        process.env.NODE_ENV = "prod";
        assert.ok(Util.hiddenLog);

        process.env.NODE_ENV = "production";
        assert.ok(Util.hiddenLog);

        process.env.NODE_ENV = "dev";
        assert.ok(!Util.hiddenLog);
    });

    it("getMonthWeek", function () {
        const res = Util.getMonthWeek(2020, 11, 12);
        assert.strictEqual(res.year, 2020);
        assert.strictEqual(res.month, 11);
        assert.strictEqual(res.week, 2);
    });

    it("formatTime", function () {
        const res = Util.formatTime("2020111214");
        assert.strictEqual(res.year, "2020");
        assert.strictEqual(res.month, "11");
        assert.strictEqual(res.week, "2");
        assert.strictEqual(res.day, "12");
        assert.strictEqual(res.hour, "14");
    });

    it("formatTimeToString", function () {
        const res = Util.formatTimeToString("2020111214");
        assert.strictEqual(res, "2020-11-12 14");
    });

    it("ethAddressFormat", function () {
        const address = "0xc87C98A2cd84fC8b87916c5676C3A77E42aCBBCC";
        const res     = Util.ethAddressFormat(address);
        assert.strictEqual(res.length, address.length);
        assert.strictEqual(res, address.toLowerCase());
    });

    it("formatChainCurrency", function () {
        let data = {
            chain:    "ETH",
            currency: "USDt",
            sender:   "0xc87C98A2cd84fC8b87916c5676C3A77E42aCBBCC",
            receiver: "0x91C8cBC45D759AE6a826FC434a04b6B7C4Fdd339",
        };
        let res  = Util.formatChainCurrency(data, ["sender", "receiver"]);
        assert.strictEqual(res.chain, data.chain.toLowerCase());
        assert.strictEqual(res.currency, data.currency.toLowerCase());
        assert.strictEqual(res.sender, data.sender.toLowerCase());
        assert.strictEqual(res.receiver, data.receiver.toLowerCase());

        data.chain    = "Ieth";
        data.currency = "iUsdt";
        res           = Util.formatChainCurrency(data, ["sender", "receiver"]);
        assert.strictEqual(res.chain, data.chain.toLowerCase());
        assert.strictEqual(res.currency, data.currency.toLowerCase());
        assert.strictEqual(res.sender, data.sender.toLowerCase());
        assert.strictEqual(res.receiver, data.receiver.toLowerCase());
    });

    it("processNumberPrecision", function () {
        let data = {
            chain:  "eth",
            amount: "0.213900000000222213213213111",
        };
        assert.strictEqual(Util.processNumberPrecision(data).amount, data.amount);

        data.currency = "eth";
        assert.strictEqual(Util.processNumberPrecision(data).amount.split(".")[1].length, 10);

        data.currency = "ETH";
        assert.strictEqual(Util.processNumberPrecision(data).amount.split(".")[1].length, 10);
        assert.strictEqual(Util.processNumberPrecision(data).currency, "ETH");

        data.currency = "ieth";
        assert.strictEqual(Util.processNumberPrecision(data).amount.split(".")[1].length, 10);

        data.currency = "usdt";
        assert.strictEqual(Util.processNumberPrecision(data).amount.split(".")[1].length, 4);

        data.currency = "iusdt";
        assert.strictEqual(Util.processNumberPrecision(data).amount.split(".")[1].length, 4);

        data.currency = "trx";
        assert.strictEqual(Util.processNumberPrecision(data).amount.split(".")[1].length, 6);

        data.currency = "cny";
        assert.strictEqual(Util.processNumberPrecision(data).amount.split(".")[1].length, 2);

        data.currency = "other";
        assert.strictEqual(Util.processNumberPrecision(data).amount, data.amount);
    });

    it("processNumberPrecisionKeys", function () {
        let data = {
            chain:     "eth",
            amount:    "0.213900000000222213213213111",
            outAmount: "0.90213213144121312312",
        };
        assert.strictEqual(Util.processNumberPrecisionKeys(data).amount, data.amount);
        assert.strictEqual(Util.processNumberPrecisionKeys(data).outAmount, data.outAmount);

        data.currency = "eth";
        assert.strictEqual(Util.processNumberPrecisionKeys(data).amount.split(".")[1].length, 10);
        assert.strictEqual(Util.processNumberPrecisionKeys(data, ["outAmount"]).outAmount.split(".")[1].length, 10);

        data.currency = "ETH";
        assert.strictEqual(Util.processNumberPrecisionKeys(data).amount.split(".")[1].length, 10);
        assert.strictEqual(Util.processNumberPrecisionKeys(data, ["outAmount"]).outAmount.split(".")[1].length, 10);
        assert.strictEqual(Util.processNumberPrecisionKeys(data).currency, "ETH");


        data.currency = "ieth";
        assert.strictEqual(Util.processNumberPrecisionKeys(data).amount.split(".")[1].length, 10);
        assert.strictEqual(Util.processNumberPrecisionKeys(data, ["amount", "outAmount"]).amount.split(".")[1].length, 10);
        assert.strictEqual(Util.processNumberPrecisionKeys(data, ["amount", "outAmount"]).outAmount.split(".")[1].length, 10);


        data.currency = "usdt";
        assert.strictEqual(Util.processNumberPrecisionKeys(data).amount.split(".")[1].length, 4);
        assert.strictEqual(Util.processNumberPrecisionKeys(data, ["amount", "outAmount"]).amount.split(".")[1].length, 4);
        assert.strictEqual(Util.processNumberPrecisionKeys(data, ["amount", "outAmount"]).outAmount.split(".")[1].length, 4);

        data.currency = "iusdt";
        assert.strictEqual(Util.processNumberPrecisionKeys(data).amount.split(".")[1].length, 4);
        assert.strictEqual(Util.processNumberPrecisionKeys(data, ["amount", "outAmount"]).amount.split(".")[1].length, 4);
        assert.strictEqual(Util.processNumberPrecisionKeys(data, ["amount", "outAmount"]).outAmount.split(".")[1].length, 4);

        data.currency = "trx";
        assert.strictEqual(Util.processNumberPrecisionKeys(data).amount.split(".")[1].length, 6);
        assert.strictEqual(Util.processNumberPrecisionKeys(data, ["amount", "outAmount"]).amount.split(".")[1].length, 6);
        assert.strictEqual(Util.processNumberPrecisionKeys(data, ["amount", "outAmount"]).outAmount.split(".")[1].length, 6);

        data.currency = "cny";
        assert.strictEqual(Util.processNumberPrecisionKeys(data).amount.split(".")[1].length, 2);
        assert.strictEqual(Util.processNumberPrecisionKeys(data, ["amount", "outAmount"]).amount.split(".")[1].length, 2);
        assert.strictEqual(Util.processNumberPrecisionKeys(data, ["amount", "outAmount"]).outAmount.split(".")[1].length, 2);

        data.currency = "other";
        assert.strictEqual(Util.processNumberPrecisionKeys(data).amount, data.amount);
    });

    it("processAmountPrecision", function () {
        let data = {
            chain:  "eth",
            amount: "0.213900000000222213213213111",
        };
        assert.strictEqual(Util.processAmountPrecision(data).amount, data.amount);

        data.currency = "eth";
        assert.strictEqual(Util.processAmountPrecision(data).amount.split(".")[1].length, 10);
        assert.ok(Util.processAmountPrecision(data).hasOwnProperty("residue"));

        data.currency = "ETH";
        assert.strictEqual(Util.processAmountPrecision(data).amount.split(".")[1].length, 10);
        assert.strictEqual(Util.processAmountPrecision(data).currency, "ETH");

        data.currency = "ieth";
        assert.strictEqual(Util.processAmountPrecision(data).amount.split(".")[1].length, 10);

        data.currency = "usdt";
        assert.strictEqual(Util.processAmountPrecision(data).amount.split(".")[1].length, 4);

        data.currency = "iusdt";
        assert.strictEqual(Util.processAmountPrecision(data).amount.split(".")[1].length, 4);

        data.currency = "trx";
        assert.strictEqual(Util.processAmountPrecision(data).amount.split(".")[1].length, 6);

        data.currency = "cny";
        assert.strictEqual(Util.processAmountPrecision(data).amount.split(".")[1].length, 2);

        data.currency = "other";
        assert.strictEqual(Util.processAmountPrecision(data).amount, data.amount);
    });

    it("apolloOption()", function () {
        let apolloOptions = Util.apolloOption(APOLLO_DEFAULT_OPTIONS);
        assert.ok(apolloOptions.hasOwnProperty("host"));
        assert.ok(apolloOptions.hasOwnProperty("cluster"));
        assert.ok(apolloOptions.hasOwnProperty("appId"));
        assert.ok(apolloOptions.hasOwnProperty("namespace"));
    });

    after(() => {
        logger.info("-------------------------------------------------------------------end<");
    });

});