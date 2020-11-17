const assert                    = require("assert");
const {RedisLock, Apollo, Util} = require("../../index");
const logger                    = require("dplatform-logger")();


describe("RedLock.plugin", function () {

    let redisLock;
    it("constructor()", function () {
        let _redis = Apollo.get("redis");
        redisLock  = new RedisLock({logger});
        assert.ok(redisLock.hasOwnProperty("redLock"));
        assert.strictEqual(redisLock.redLock.servers.length, _redis.length);
    });

    it("lock()", async function () {
        this.timeout(10000);
        let key    = "testjob";
        //第一次锁
        let locker = await redisLock.lock(key, 10000 * 10);
        assert.ok(locker.hasOwnProperty("value"));
        assert.ok(locker.hasOwnProperty("expiration"));
        await Util.sleep(3000);

        //间隔三秒再未解锁之前再次使用相同的key进行锁，此时返回false, 在这里可以通过该锁实现并发job限制
        let locker2 = await redisLock.lock(key, 10000 * 10);
        assert.ok(!locker2);

        //解锁
        locker.unlock();
    });
});