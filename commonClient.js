const config = require('./config'),
    ENV = process.env.NODE_ENV || "dev";
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

    /**
     * Set Redis system.client.#id => #id with expired time to know what client online now
     */
    sendKeepalive() {
        const client = this._createClient();
        client.set("system.clients." + this._clientNumber, +Date.now(), "EX",
            Math.round(config.keepAliveTimeout[ENV] / 1000),
            (err, reply) => {
                if (err) return errorHandler(err);
            });
        client.quit();
    }

    /**
     * Get all client's online
     * @param {function} callback
     */
    getAllClientsOnline(callback) {
        const _client = this._createClient();
        _client.keys("system.clients.*", function (err, reply) {
            if (err) return errorHandler(err);
            callback(reply);
        });
        _client.quit();
    }

    /**
     * Find client with lowest id and return it to create new generator
     * @param clients
     * @return {number} clientId
     */
    getNewGenerator(clients) {
        return Math.min.apply(null, clients.map((client) => {
            return parseInt(client.replace("system.clients.", ""));
        }));
    }

    /**
     * Set Redis system.client.#id => #id with expired time to know what client online now
     * @param {function} callback
     */
    static getErrors(callback) {
        const client = redis.createClient(config.redisPort[ENV]);
        client.multi()
            .hgetall("system.errors")
            .del("system.errors")
            .exec((err, resp) => {
                if (err) return errorHandler(err);
                callback(resp[0])
            });
        client.quit();
    }

    _createClient() {
        return redis.createClient(config.redisPort[ENV]);
    }
}

module.exports = Client;