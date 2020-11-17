module.exports = {
    APP:             {
        SERVER_NAME: "dplatform-report",
    },
    HTTP_CONNECTION: {
        TIMEOUT: 10 * 1000,
        HEADERS: {
            "Content-Type": "application/json",
            "Accept":       "application/json",
        },
    },

    APOLLO_DEFAULT_OPTIONS: {
        namespace: "application",
        cluster:   "default",
        appId:     "dplatform-report",
    },

    WALLET_APIS:    {
        USER_BALANCE:    "/inner/info/address/balance",
        ACCOUNT_BALANCE: "/common/info/balance",
    },
    EUREKA_SERVICE: {
        WALLET:         "wallet",
        PAYMENT:        "payment",
        INFRASTRUCTURE: "infrastructure",
        RELATIONSHIP:   "relationship",
    },


};