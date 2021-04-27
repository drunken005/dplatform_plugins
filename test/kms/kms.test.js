const assert = require("assert");
const _      = require("lodash");
const {Kms}  = require("../../");

const AliasName = "dplatform-test";

describe("Kms.pligin", async function () {
    let plaintext   = "MSAZ&12dsasXC=90", encryptText;
    let keyId;
    let privateKeys = "07fed02bdb20efe5297445472e2ad0647c9e288a5e28a4e0c7c18ceefc09b47999";
    let password    = "p@ssw0rd", encryptPwd, encryptPrivate;
    let kms;

    before(() => {
        kms = new Kms();
    });

    it("encrypt()", async function () {
        this.timeout(10000);
        let al      = await kms.client.listAliases();
        let aliases = al.Aliases.Alias;
        let key     = _.find(aliases, {AliasName: `alias/${AliasName}`});
        keyId       = key.KeyId;
        assert.ok(key.hasOwnProperty("AliasName"));
        assert.ok(key.hasOwnProperty("KeyId"));
        assert.ok(key.hasOwnProperty("AliasArn"));
        encryptText = await kms.encrypt(key.KeyId, plaintext);
        assert.strictEqual(typeof encryptText, "string");
    });

    it("decrypt()", async function () {
        this.timeout(10000);
        let decryptText = await kms.decrypt(encryptText);
        assert.strictEqual(typeof decryptText, "string");
        assert.strictEqual(decryptText, plaintext);
    });

    it("encryptPrivateKey()", async function () {
        this.timeout(10000);

        //使用密码加密私钥
        let encryptData = await kms.encryptPrivateKey(keyId, privateKeys, password);
        assert.ok(encryptData.hasOwnProperty("encryptPwd"));
        assert.ok(encryptData.hasOwnProperty("encryptPrivate"));

        encryptPwd     = encryptData.encryptPwd;
        encryptPrivate = encryptData.encryptPrivate;
    });

    it("decryptPrivate()", async function () {
        this.timeout(10000);
        //使用加密后的密码解密加密后的私钥
        let decryptData = await kms.decryptPrivate(encryptPrivate, encryptPwd);
        assert.strictEqual(decryptData.length, 1);
        assert.strictEqual(decryptData[0], privateKeys);
    });


});


