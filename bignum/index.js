const ethUnit = require("ethjs-unit");
const BN      = require("bn.js");
const _       = require("lodash");

class BigNumber {
    static toWei(numberStr, unit) {
        if (_.isNaN(Number(numberStr))) {
            return null;
        }
        unit = unit || "tether";
        return ethUnit.toWei(numberStr.toString(), unit).toString(10);
    }

    static fromWei(numberStr, unit) {
        if (_.isNaN(Number(numberStr))) {
            return null;
        }
        unit = unit || "tether";
        return ethUnit.fromWei(numberStr.toString(), unit).toString(10);
    }

    static toEtherWei(numberStr) {
        return BigNumber.toWei(numberStr, "ether");
    }

    static fromEtherWei(numberStr) {
        return BigNumber.fromWei(numberStr, "ether");
    }

    /**
     * params  +
     * @returns {*}
     */
    static add() {
        let numbers = Array.prototype.slice.apply(arguments);
        if (!numbers || !numbers.length) {
            return null;
        }
        let bn;
        _.each(numbers, (number) => {
            if (!number) {
                number = 0;
            }
            number = BigNumber.toWei(number.toString());
            if (!bn) {
                bn = new BN(number.toString());
            } else {
                let newBn = new BN(number.toString());
                bn        = bn.add(newBn);
            }
        });
        return BigNumber.fromWei(bn.toString());
    }

    /**
     * params *
     * @returns {*}
     */
    static mul() {
        let numbers = Array.prototype.slice.apply(arguments);
        if (!numbers || !numbers.length) {
            return null;
        }
        let bn;
        _.each(numbers, (number) => {
            if (!number) {
                number = 0;
            }
            number = BigNumber.toWei(number.toString());
            if (!bn) {
                bn = new BN(number.toString());
            } else {
                let newBn = new BN(number.toString());
                bn        = bn.mul(newBn);
            }
        });

        let result = bn.toString();
        _.each(numbers, (n, index) => {
            result = BigNumber.fromWei(result);
            if (index === 0 && result.split(".").length > 1) {
                result = result.split(".")[0];
            }
        });
        return result;
    }

    /**
     * params -
     * @returns {*}
     */
    static sub() {
        let numbers = Array.prototype.slice.apply(arguments);
        if (!numbers || !numbers.length) {
            return null;
        }
        let bn;
        _.each(numbers, (number) => {
            if (!number) {
                number = 0;
            }
            number = BigNumber.toWei(number.toString());
            if (!bn) {
                bn = new BN(number.toString());
            } else {
                let newBn = new BN(number.toString());
                bn        = bn.sub(newBn);
            }
        });
        return BigNumber.fromWei(bn.toString());
    }
}

BigNumber.unitMap = ethUnit.unitMap;

module.exports = BigNumber;