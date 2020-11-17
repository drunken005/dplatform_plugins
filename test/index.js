const _                             = require("lodash");
const {APP, APOLLO_DEFAULT_OPTIONS} = require("./constant");
const logger                        = require("dplatform-logger")(APP.SERVER_NAME);
const {Util, Apollo}                = require("../index");

module.exports = (async () => {
    logger.info("-------------------------------------------------------------------begin>");
    const options = Util.apolloOption(_.assign({}, APOLLO_DEFAULT_OPTIONS, {logger}));
    await Apollo.init(options);
})();