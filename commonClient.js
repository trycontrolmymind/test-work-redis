const config = require('./config'),
    ENV = process.env.NODE_ENV;
const redis = require("redis");
const errorHandler = require("./errorHandler");
class Client {
    constructor() {
        this._clientNumber = Client.getRandomInt();
    }

    get clientNumber() {
        return this._clientNumber;
    }

    static getRandomInt() {
        return Math.round(Math.random() * 100000)
    }

    sendKeepalive() {
        const _client = this._createClient();
        _client.set("system.clients." + this._clientNumber, +Date.now(), "EX", 
            Math.round(config.keepAliveTimeout[ENV]/1000), 
            (err, reply) => { if (err) return errorHandler(err); });
        _client.quit();
    }

    getAllClientsOnline() {
        const _client = this._createClient();
        _client.keys("system.clients.*", function (err, reply) {
            if (err) return errorHandler();
        });
        _client.quit();
    }

    _createClient() { return redis.createClient(config.redisPort[ENV]); }
}

module.exports = Client;