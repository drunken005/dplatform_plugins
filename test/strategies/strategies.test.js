const assert            = require("assert");
const strategies        = require("../../strategies");
const {HTTP_CONNECTION} = require("../constant");


const createStrategy = (endpointUrls) => {
    const strategy = endpointUrls.length > 1 ? "round-robin" : "static";
    const Strategy = strategies[strategy];
    return new Strategy(endpointUrls);
};

describe("Strategies.plugin", () => {
    let loadBalance;
    let points = ["http://google.com", "www://baidu.com", "http://souhu.com"];

    it("constructor ", function () {
        loadBalance = createStrategy(points);
        assert.strictEqual(loadBalance.endpointIndex, 0);
        assert.strictEqual(loadBalance.endpointMaxIndex, points.length - 1);
    });

    it("nextTarget()", function () {
        let target = loadBalance.nextTarget();
        assert.strictEqual(target.method, "POST");
        assert.ok(target.json);
        assert.strictEqual(target.timeout, HTTP_CONNECTION.TIMEOUT);
        assert.strictEqual(target.uri, points[0]);
        assert.strictEqual(loadBalance.endpointIndex, 1);

        target = loadBalance.nextTarget();
        assert.strictEqual(target.uri, points[1]);
        assert.strictEqual(loadBalance.endpointIndex, 2);

        target = loadBalance.nextTarget();
        assert.strictEqual(target.uri, points[2]);
        assert.strictEqual(loadBalance.endpointIndex, 0);

        target = loadBalance.nextTarget();
        assert.strictEqual(target.uri, points[0]);
        assert.strictEqual(loadBalance.endpointIndex, 1);
    });

    it("Static", function () {
        points      = ["http://127.0.0.1:8080"];
        loadBalance = createStrategy(points);

        assert.ok(!loadBalance.hasOwnProperty("endpointIndex"));
        assert.ok(!loadBalance.hasOwnProperty("endpointMaxIndex"));

        let target = loadBalance.nextTarget();
        assert.strictEqual(target.uri, points[0]);

        target = loadBalance.nextTarget();
        assert.strictEqual(target.uri, points[0]);

    });
});