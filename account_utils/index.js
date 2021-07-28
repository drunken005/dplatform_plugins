const Crypto                        = require("crypto");
const bcrypt                        = require("bcrypt");
const random                        = require("randomstring");
const BASE64_CHARS                  = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_";
const DEFAULT_LOGIN_EXPIRATION_DAYS = 7;

const _bcryptRounds = 10;

const sha256 = (str, encoding = "hex") => {
    return Crypto.createHash("sha256").update(str).digest(encoding);
};


const mobileVerify = (mobile) => {
    let reg = /^((0\d{2,3}-\d{7,8})|(1[3584]\d{9}))$/;

    return reg.test(mobile);
};

const getPasswordString = (password) => {
    if (typeof password === "string") {
        password = sha256(password);
    } else { // 'password' is an object
        if (password.algorithm !== "sha-256") {
            throw new Error("Invalid password hash algorithm. Only 'sha-256' is allowed.");
        }
        password = password.digest;
    }
    return password;
};

const hashPassword = (password, bcryptRounds) => {
    bcryptRounds = bcryptRounds || _bcryptRounds;
    password     = getPasswordString(password);
    return bcrypt.hashSync(password, bcryptRounds);
};

const checkPassword = (password, hashedPassword) => {
    const formattedPassword = getPasswordString(password);
    return bcrypt.compareSync(formattedPassword, hashedPassword);
};

const getTokenLifetimeMs = (loginExpirationInDays) => {
    return (loginExpirationInDays || DEFAULT_LOGIN_EXPIRATION_DAYS) * 24 * 60 * 60 * 1000;  // n day
};

const tokenExpiration = (when) => {
    return new Date((new Date(when)).getTime() + getTokenLifetimeMs());
};

const generateStampedLoginToken = () => {
    const tokenStr = random.generate({
        length:  43,
        charset: BASE64_CHARS,
    });
    return {
        token: sha256(tokenStr, "base64"),
        when:  new Date(),
    };
};

const generateLoginToken = () => {
    const {when, token} = generateStampedLoginToken();
    const tokenExpire   = tokenExpiration(when);
    return {
        token,
        tokenExpire,
    };
};

const hashLoginToken = (resume) => {
    return sha256(resume, "base64");
};


module.exports = {
    sha256,
    mobileVerify,
    getPasswordString,
    hashPassword,
    checkPassword,
    getTokenLifetimeMs,
    tokenExpiration,
    generateStampedLoginToken,
    generateLoginToken,
    hashLoginToken,
};