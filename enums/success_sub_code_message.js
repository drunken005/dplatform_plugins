const Enum             = require("enum");
const SubCodeStateEnum = require("./sub_code_state");

let SuccessSubCodeMessageEnum = new Enum({
    [SubCodeStateEnum.ONE.value]: "SUCCESS",
    [SubCodeStateEnum.TWO.value]: "FAIL",
});


module.exports = SuccessSubCodeMessageEnum;