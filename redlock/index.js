const _       = require("lodash");
const Redis   = require("ioredis");
const RedLock = require("redlock");
const Apollo  = require("../apollo");


class RedisLock {
    constructor(options) {
        const logger = options.logger || console;
        let _redis   = Apollo.get("redis");
        if (!_redis) {
            logger.info("Current service not support redis");
            this.redLock = false;
            return;
        }
        const clients = () => {
            return _.map(_redis, (_config) => {
                let client = new Redis(_.pick(_config, ["host", "port", "password"]));
                client.on("ready", () => {
                    logger.info(`Redis ${_config.host} is ready`);
                });
                return client;
            });
        };
        const redLock = new RedLock(
            // you should have one client for each independent redis node
            // or cluster
            clients(),
            {
                driftFactor: 0.01, // time in ms
                retryCount:  0,
                retryDelay:  150, // time in ms
                retryJitter: 50, // time in ms
            },
        );
        redLock.on("clientError", function (err) {
            logger.error("A redis error has occurred:", err);
        });
        this.redLock = redLock;
    }

    /**
     * @param key Job name
     * @param ttl Job lock expiration time
     * @param redis_namespace
     * @returns {Promise<boolean|*>}
     */
    async lock(key, ttl, redis_namespace = "REDIS_LOCKER") {
        let resource = [redis_namespace, key].join("-");
        try {
            return await this.redLock.lock(resource, ttl);
        } catch (error) {
            return false;
        }
    }
}

module.exports = RedisLock;