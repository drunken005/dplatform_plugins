const NodeRSA = require("node-rsa");
const _       = require("lodash");

class Rsa {
    constructor(privateKey, publicKey) {
        this.cipher = new NodeRSA();
        privateKey && this.cipher.importKey(privateKey, "pkcs8-private-pem");
        publicKey && this.cipher.importKey(publicKey, "pkcs8-public-pem");
    }

    /**
     *
     * @param context {string|number|object|array|Buffer} - data for signing. Object and array will convert to JSON string.
     * @param encoding {string} - optional. Encoding for output result, may be 'buffer', 'binary', 'hex' or 'base64'. Default 'buffer'.
     * @param source_encoding {string} - optional. Encoding for given string. Default utf8.
     * @returns {string|Buffer}
     */
    sign(context, encoding = "base64", source_encoding = "utf-8") {
        return this.cipher.sign(context, encoding, source_encoding);
    }


    /**
     *  Verifying signed data
     *
     * @param data - signed data
     * @param signature
     * @param source_encoding {string} - optional. Encoding for given string. Default utf8.
     * @param signature_encoding - optional. Encoding of given signature. May be 'buffer', 'binary', 'hex' or 'base64'. Default 'buffer'.
     * @returns {*}
     */
    verify(data, signature, source_encoding = "utf-8", signature_encoding = "base64") {
        return this.cipher.verify(data, signature, source_encoding, signature_encoding);
    }

    /**
     * Create and rsa keyPair
     * @returns {{privateKey, publicKey}|{privateKey: *, publicKey: *}}
     */
    export() {
        if (!this.cipher.keyPair.cache) {
            let KeyPair = this.cipher.generateKeyPair();
            return {
                privateKey: KeyPair.exportKey("pkcs8-private-pem"),
                publicKey:  KeyPair.exportKey("pkcs8-public-pem"),
            };
        }
        return {
            privateKey: this.cipher.exportKey("pkcs8-private-pem"),
            publicKey:  this.cipher.exportKey("pkcs8-public-pem"),
        };
    }

    /**
     *
     * @param params
     * @returns {string} {"name":"rsa","version":"1.1.1"}
     */
    static sortParamsToJson(params) {
        let keys = _.sortBy(_.keys(params));
        let obj  = {};
        _.each(keys, (key) => {
            if (params[key] != null) {
                obj[key] = params[key];
            }
        });
        return JSON.stringify(obj);
    }


    /**
     *
     * @param params
     * @returns {string} e.g: name=rsa&version=1.1.1
     */
    static sortParamsToStr(params) {
        let keys = _.sortBy(_.keys(params));
        let strs = [];
        _.each(keys, (key) => {
            if (params[key] != null || params[key] !== undefined || params[key] !=='') {
                strs.push(`${key}=${params[key]}`);
            }
        });
        return strs.join("&");
    }

}

module.exports = Rsa;

// Demo code

/*const KeyPair = {
    privateKey: "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCWP+dSDnjvN8kr\n" +
                    "/Sn5EcfDgseA6ens1SOsFTdIs+4D3rNCJDh8VvHfYTQHMgpe4n8+6VRn5g0U2JBI\n" +
                    "Flisvrk2xWb3xZ/UGzfalc+V5HEmC+b6BdDXiS6xTukp4yMJaeRhpfvFYp/dqwkT\n" +
                    "obyd/pCNJToSgfSQzZK62wdo8xfK2pnX7ddxPOTay5Ku/q0rv9RXB6/uME9m4Xa9\n" +
                    "GzG2Nu9xbXK3Czr02ibtpnOQgyOzod8q1glI02HLKv7M6wP0UCZNykLVY45FJZAV\n" +
                    "qh+scgQIw8Xh0HWKFOIgVTmSj7/PaqZcY/FtoMdsglcTejwDFNV9PEPgiMRrWKnw\n" +
                    "N309TbEjAgMBAAECggEAAgkroTkA+nzPBQGRKAbNpiCHg3+n48Wfjh1bemi1uOez\n" +
                    "lhnXihfDfztZ8R8EdPSstLWEp0O+uaGVkuR6nxyWdd+G3aSX3c/gmd2dynIl9lYC\n" +
                    "8zBQ/Bqnv09KaX7iYqZEqe4N00ba064VmWZ/n8RrQP5YIxgPsEaYzl9ZYlqo397B\n" +
                    "B/BZtePJghS6+cTdFgGxzTusyzTozJIHXMe96AMGzZLUtaRAzVbavhMLtHrY6T7C\n" +
                    "fhsjZmbc9XKV7ns5zkmS7zd3P/tytjJWrAPNxR/YRwrbwpk6uuH99+u3Cye4qLLl\n" +
                    "2l2Lc3vcXotfGAUBFGnFvGEB0FJQuj/Ma+v9MRsSQQKBgQDiwSXyLMvjvaovvvoI\n" +
                    "NPCSanVwyfrfgjEiucMcYlkvUaE86FyGjDxNZ9UDOCLBK4UGC1Dll1WE5042Rg4m\n" +
                    "29SIkhh1g6ccsNfcGiRIo08wNcjG/GLcq93mPhx+eUTbobrtPxzvn10/KzeFA9oP\n" +
                    "m6mSyZ0FBEYJQu9ZCYlvC26sFwKBgQCpoMLOtiv9HaNjXsRl3cqzPgT6Rk/1O4Nf\n" +
                    "41Bj0CNIBfUQxS4ADsUIiMMWiTnuCVxY36BhhQT3UrJLrbx+GdCY5IQeMvnv87Zj\n" +
                    "vInwIzFqDgpU9nCscHUCQEt62RJwvfVUbQTA7sAdeLfl1xfI0v4+nzpKAkcKkAsk\n" +
                    "Ajy5svLO1QKBgQCBN/aK2pJaNwRb7yYHNTv/BCHm44NOiZ+8nUWd0EHooEkVL4lC\n" +
                    "t3nJ1qjiC8RqdoV420v/ek0mzrWYYjXAWTf1l+POW/cId5KbgF468q222H+RPdSM\n" +
                    "0nhCtBSC0lK2IqUme/fead+2lsctyvMiP9/ToYcUi8npjzZcc/3YxRgNgwKBgD3V\n" +
                    "fm3/9lUUgsTsfMdtbECesQ3Sp78LbL59jIZ2DwZoNYdheX1H5QdRY1xJtbZR7znu\n" +
                    "evZRmRfXK2tu77FAE8xIMOkZSAbyXmBJEDdbfN3eNGH4W+ZgMCcb7OfhTVmPxWh7\n" +
                    "PSpfXeTgZpkAKYlpcIi/Xm4wGll9XLJJpn1DAEPpAoGBANpTcK1ZSJ/uvZEICjmk\n" +
                    "SzkVoCHat4j19eublOMCwiwJHOL5nG6tyaZ0cB5p0IWV1Rbl50oFZIaOj/1akY9p\n" +
                    "rdaIIQW1+eXvpGiS2O16SbN5dC9dNeHmXBvjYRbwGCV1cbwuBd/5zvazcFLF1A4Y\n" +
                    "DHRkE0FSqroDRG72NrtkkuKF",
    publicKey:  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlj/nUg547zfJK/0p+RHH\n" +
                    "w4LHgOnp7NUjrBU3SLPuA96zQiQ4fFbx32E0BzIKXuJ/PulUZ+YNFNiQSBZYrL65\n" +
                    "NsVm98Wf1Bs32pXPleRxJgvm+gXQ14kusU7pKeMjCWnkYaX7xWKf3asJE6G8nf6Q\n" +
                    "jSU6EoH0kM2SutsHaPMXytqZ1+3XcTzk2suSrv6tK7/UVwev7jBPZuF2vRsxtjbv\n" +
                    "cW1ytws69Nom7aZzkIMjs6HfKtYJSNNhyyr+zOsD9FAmTcpC1WOORSWQFaofrHIE\n" +
                    "CMPF4dB1ihTiIFU5ko+/z2qmXGPxbaDHbIJXE3o8AxTVfTxD4IjEa1ip8Dd9PU2x\n" +
                    "IwIDAQAB",
};



const data = {
    name:    "rsa",
    version: "1.1.1",
};

console.log(Rsa.sortParamsToJson(data));
console.log(Rsa.sortParamsToStr(data));


let rsa       = new Rsa(KeyPair.privateKey);
let signature = rsa.sign(Rsa.sortParamsToJson(data));
console.log({signature});
let verify = rsa.verify(JSON.stringify(data), signature);
console.log(verify);*/
