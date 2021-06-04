const Sequelize = require("sequelize");
const Apollo    = require("../apollo");
const Util      = require("../utils");
const _         = require("lodash");

class Mysql {
    static connect(options) {
        const logger = options.logger || console;

        try {
            const mysqlParams = Apollo.getMysqlConnection();
            let sequelize     = !!mysqlParams ? new Sequelize(...mysqlParams) : new Sequelize(_.omit(options, "logger"));
            logger.info(`Mysql connection open to ${!!mysqlParams ? Util.filterURLPassword(mysqlParams[0]) : Util.filterOptionsPassword(options)}`);
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
