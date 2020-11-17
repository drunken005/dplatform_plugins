const Enum = require("enum");

let HttpMethodEnum = new Enum({
    "GET":    0,
    "POST":   1,
    "PUT":    2,
    "DELETE": 3,
});


module.exports = HttpMethodEnum;