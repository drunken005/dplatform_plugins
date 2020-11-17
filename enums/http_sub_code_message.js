const Enum             = require("enum");
const SubCodeStateEnum = require("./sub_code_state");

let HttpSubCodeMessageEnum = new Enum({
    [SubCodeStateEnum.ONE.value]: "NetworkTimeout()",
    [SubCodeStateEnum.TEN.value]: "HttpUncaughtException()",
});


module.exports = HttpSubCodeMessageEnum;