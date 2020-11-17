const Enum             = require("enum");
const SubCodeStateEnum = require("./sub_code_state");

let CommonSubCodeMessageEnum = new Enum({
    [SubCodeStateEnum.ONE.value]:   "InvalidParameter()",
    [SubCodeStateEnum.TWO.value]:   "ItemNotFound()",
    [SubCodeStateEnum.THREE.value]: "MySQLException()",
    [SubCodeStateEnum.FOUR.value]:  "NotSufficientCash()",
    [SubCodeStateEnum.FIVE.value]:  "TooManyRequests()",
    [SubCodeStateEnum.SIX.value]:   "ItemMisMatched()",
    [SubCodeStateEnum.TEN.value]:   "UncaughtException()",
});

module.exports = CommonSubCodeMessageEnum;