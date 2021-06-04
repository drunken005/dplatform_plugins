const EventEmitter   = require("events");
const _              = require("lodash");
const BaseMiddleware = require("./base");
const Util           = require("../utils");
const Apollo         = require("../apollo");
const RedisLock      = require("../redlock");
const Eureka         = require("../eureka");


class SchedulerMiddleware extends EventEmitter {

    /**
     * 任务调度
     * @param jobName 任务名称
     * @param jobList 任务实例
     * @param logger  日志收集器
     */
    constructor(jobName, jobList, logger, interval) {
        super();
        this.logger   = logger || console;
        const service = Apollo.get(jobName);

        const eurekaOption = {
            ...service,
            logger,
            name:   jobName,
            eureka: Apollo.get("eureka"),
        };
        (service && service.eurekaServices) && new Eureka(eurekaOption).start();

        interval = service && service.interval ? service.interval : interval;

        this.redisLock    = new RedisLock({logger});
        this.__job_name__ = `${this.constructor.name}(${jobName})`;
        this.__job_list__ = jobList;
        this.__interval__ = interval * 1000;

        this.on("startup", this.onStartUp.bind(this));
        this.on("update", this.onUpdate.bind(this));
        this.on("error", this.onError.bind(this));
        this.emit("startup");
    }

    /**
     * 启动事件
     * @returns {Promise<void>}
     */
    async onStartUp() {
        this.emit("update");
    }

    /**
     * 更新事件
     * @returns {Promise<void>}
     */
    async onUpdate() {
        let startTime         = Date.now();
        let executeTimingTask = Apollo.get("timingTaskSwitch");
        let self              = this;
        try {
            let jobList = [];
            for (let job of this.__job_list__) {
                if (executeTimingTask && executeTimingTask === "off") {
                    self.logger.info(`Read apollo config 'timingTaskSwitch = off', current job exit.`);
                    continue;
                }
                if (this.redisLock.redLock) {
                    let lock = await this.redisLock.lock(job.job, this.__interval__ * 10);
                    if (!lock) {
                        self.logger.info(`Execute job '${job.job}' break, current job is in progress and locked.`);
                        continue;
                    }
                    job.locker = lock;
                }
                jobList.push(job.execute());
            }
            await Promise.all(jobList);
        } catch (error) {
            BaseMiddleware.onError(error, `${this.__job_name__}.${this.onUpdate.name}()`);
        }

        let cost  = Date.now() - startTime;
        let delta = cost - this.__interval__ > 1 ? 1 : this.__interval__ - cost;

        self.logger.info(`${this.__job_name__}.${this.onUpdate.name}()||sleep=${delta}ms\n`);
        await Util.sleep(delta).catch(BaseMiddleware.onUncaughtException);

        this.emit("update");
    }

    /**
     * 错误事件
     * @param error
     */
    onError(error) {
        BaseMiddleware.onError(error, `${this.__job_name__}.${this.onError.name}()`);
    }
}


process.on("uncaughtException", BaseMiddleware.onUncaughtException);
process.on("unhandledRejection", BaseMiddleware.onUnhandledRejection);

module.exports = SchedulerMiddleware;