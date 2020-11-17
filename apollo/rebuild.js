const _ = require("lodash");

const rebuild = (flatten) => {

    let copy = [], _flatten = _.cloneDeep(flatten);
    _.each(_flatten, function (val, key) {
        let paths  = key.split(".");
        let levels = [];
        let lastPath;
        let c      = copy;
        paths.forEach((path, idx) => {
            let pathIsNum = /^\d+$/.test(path);
            if (!pathIsNum && _.isArray(c)) {
                let o = {};
                c.forEach((v, k) => o[k] = v);
                c = o;
                if (idx === 0) {
                    copy = o;
                } else {
                    levels[idx - 1][lastPath] = o;
                }
            }
            levels.push(c);
            if (idx === paths.length - 1) {
                return c[path] = val;
            }
            lastPath = path;
            c        = c[path] = c[path] || [];
        });
    });
    return copy;
};

module.exports = rebuild;