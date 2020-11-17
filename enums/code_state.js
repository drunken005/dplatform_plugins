const Enum = require("enum");

const CodeStateEnum = new Enum({
    "SUCCESS": "000000",
    "COMMON":  "100000",
    "HTTP":    "200000",
});


module.exports = CodeStateEnum;