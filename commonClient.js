const config = require('./config'),
    ENV = process.env.NODE_ENV;
const redis = require("redis");
const errorHandler = require("./errorHandler");

class Client {
    constructor() {
        this._clientNumber = Client.getRandomInt();
        console.log(`Client #${this.clientNumber} logged in`);
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
            Math.round(config.keepAliveTimeout[ENV] / 1000),
            (err, reply) => {
                if (err) return errorHandler(err);
            });
        _client.quit();
    }

    getAllClientsOnline(callback) {
        const _client = this._createClient();
        _client.keys("system.clients.*", function (err, reply) {
            if (err) return errorHandler(err);
            callback(reply);
        });
        _client.quit();
    }

    getNewGenerator(clients) {
        return Math.min.apply(null, clients.map((client) => {
            return parseInt(client.replace("system.clients.", ""));
        }));
    }

    _createClient() {
        return redis.createClient(config.redisPort[ENV]);
    }
}

module.exports = Client;