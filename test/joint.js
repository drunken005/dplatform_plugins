const _             = require("lodash");
const {
          APP,
          APOLLO_DEFAULT_OPTIONS,
          HTTP_CONNECTION,
          EUREKA_SERVICE,
          WALLET_APIS,
      }             = require("./constant");
//logger init
const logger        = require("dplatform-logger")(APP.SERVER_NAME);
const {
          Apollo,
          errors,
          EurekaClient,
          EurekaStorage,
          Http,
          Mysql,
          Parameter,
          RedisLock,
          Util,
      }             = require("../");
const {MyException} = errors;

module.exports = (async () => {
    //Apollo plugin usage
    await Apollo.init(Util.apolloOption(_.assign({}, APOLLO_DEFAULT_OPTIONS, {logger})));

    //Get Apollo cache
    const appInfo         = Apollo.get(APP.SERVER_NAME);
    const mysqlConnection = Apollo.getMysqlConnection();
    const db              = Apollo.get("db");
    logger.info("-----------------------------app info:");
    console.log(appInfo);
    logger.info("-----------------------------mysql connection:");
    console.log(mysqlConnection);
    logger.info("-----------------------------db info:");
    console.log(db);

    //Eureka plugin usage
    const eurekaOptions = _.assign({}, appInfo, {
        eureka: Apollo.get("eureka"),
        name:   APP.SERVER_NAME,
        logger,
    });

    new EurekaClient(eurekaOptions).start();

    //EurekaStorage plugin usage
    await Util.sleep(2000); //TODO 这里需要等待Eureka缓存
    let options = EurekaStorage.getTarget(EUREKA_SERVICE.WALLET, WALLET_APIS.ACCOUNT_BALANCE);
    logger.info("-----------------------------request wallet option:");
    console.log(options);

    //Http plugin usage
    let requestOptions = _.assign({}, options, {
        body:    {
            chain:    "eth",
            currency: "eth",
            address:  "0xc87C98A2cd84fC8b87916c5676C3A77E42aCBBCC",
        },
        headers: HTTP_CONNECTION.HEADERS,
        timeout: options.timeout || HTTP_CONNECTION.TIMEOUT,
    });
    let response       = await Http.request(new Parameter(), requestOptions, logger);
    if (!MyException.isSuccess(response)) {
        logger.error(` Get balance fail. msg=${response.msg}`);
    }
    logger.info("----------------------------- get address balance:");
    console.log(response);

    // Mysql plugin usage
    const mysql = Mysql.connect({logger});

    mysql.sequelize.close();

    //RedisLock plugin usage
    const jobName   = "test1";
    //TODO 此处应该并发运行才能实现lock效果
    const redisLock = new RedisLock({logger});
    const locker    = await redisLock.lock(jobName, 100000 * 10); //100s * 10 ttl值必须大于任务执行时间，否则unlock失败
    if (!locker) {
        return logger.info(`Execute job '${jobName}' break, current job is in progress and locked.`);
    } else {
        //job execute
        logger.info(`------------------------- execute job: ${jobName}, locker: ${locker.value}`);
    }
    await Util.sleep(30000);
    logger.info("--------------------------- unlock locker..");
    locker && locker.unlock();
    logger.info("=================== " + locker.value);

})();