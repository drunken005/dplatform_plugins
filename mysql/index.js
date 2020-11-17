const Sequelize = require("sequelize");
const Apollo    = require("../apollo");
const Util      = require("../utils");

class Mysql {
    static connect(options) {
        const logger = options.logger || console;
        try {
            const mysqlParams = Apollo.getMysqlConnection();
            const sequelize   = new Sequelize(...mysqlParams);
            logger.info(`Mysql connection open to ${Util.filterURLPassword(mysqlParams[0])}`);
            return {
                sequelize,
                Sequelize,
            };
        } catch (e) {
            logger.error(e.message);
            return null;
        }
    }
}

module.exports = Mysql;
