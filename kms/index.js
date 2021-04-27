const KmsClient = require("@alicloud/kms-sdk");
const _         = require("lodash");
const Util      = require("../utils");

class Kms {
    constructor() {
        let options = Util.kmsOptions();
        this.client = new KmsClient(options);
    }

    async encrypt(keyId, plaintext, encryptionContext) {
        const encrypt = await this.client.encrypt(keyId, plaintext.toString("base64"), encryptionContext);
        if (!encrypt.CiphertextBlob) {
            throw new Error(encrypt.Message || "encrypt  error.");
        }
        return encrypt.CiphertextBlob;
    }

    async decrypt(ciphertextBlob, encryptionContext) {
        let decrypt = await this.client.decrypt(ciphertextBlob, encryptionContext);
        if (!decrypt.Plaintext) {
            throw new Error(decrypt.Message || "decrypt error.");
        }
        return decrypt.Plaintext;
    }

    async encryptPrivateKey(keyId, privateKeys, password) {
        if (_.isString(privateKeys)) {
            privateKeys = [privateKeys];
        }
        privateKeys        = Buffer.from(JSON.stringify(privateKeys)).toString("hex");
        let encryptPwd     = await this.encrypt(keyId, password);
        let encryptPrivate = await this.encrypt(keyId, privateKeys, {password: password});
        return {
            encryptPwd,
            encryptPrivate,
        };
    }

    async decryptPrivate(encryptPrivate, encryptPwd) {
        let password       = await this.decrypt(encryptPwd);
        let decryptPrivate = await this.decrypt(encryptPrivate, {password: password});
        let privateKeys    = Buffer.from(decryptPrivate, "hex").toString();
        return JSON.parse(privateKeys);
    }
}

module.exports = Kms;