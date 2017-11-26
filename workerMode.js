/**
 * Created by vd on 23.11.2017.
 */
const config = require('./config'),
    ENV = process.env.NODE_ENV || "dev";
const redis = require("redis");
const errorHandler = require("./errorHandler");

class Worker {
    /**
     * Create new Worker
     * @param {function} onNoMsgCallback call it if no messages after timeout
     * @param {number} clientId
     */
    constructor(onNoMsgCallback, clientId) {
        this.client = redis.createClient(config.redisPort[ENV]);
        this._latestMsgTime = +Date.now();
        this.onNoMsgCallback = onNoMsgCallback ? onNoMsgCallback : function () {
        };
        this.clientId = clientId;
        this.client.subscribe(config.channelName[ENV]);
        this._checkMessages();
        this._onMessage();
    }

    /**
     * Check if we have messages before timeout to create new generator if needed
     * @private
     */
    _checkMessages() {
        const self = this;
        let timerId = setTimeout(function haveMessages() {
            let msgTimeoutMs = (+Date.now()) - self._latestMsgTime;
            if (msgTimeoutMs > config.keepAliveTimeout[ENV]) {
                self.quit();
                return self.onNoMsgCallback(msgTimeoutMs);
            }
            timerId = setTimeout(haveMessages, config.keepAliveTimeout[ENV]);
        }, config.keepAliveTimeout[ENV]);
    }

    /**
     * Event listener on new message to channel
     * @private
     */
    _onMessage() {
        this.client.on("message", (channel, message) => {
            this._latestMsgTime = +Date.now();
            this._processMessage.apply(this, [message])
        });
    }

    /**
     * Function that exec transaction if it's not be processed yet
     * @param message Received message
     * @private
     */
    _processMessage(message) {
        const self = this;
        const sub = redis.createClient(config.redisPort[ENV]);

        sub.multi()
            .get(message)
            .set(message, self.clientId, "EX", config.keepAliveTimeout[ENV])
            .exec(function (err, resp) {
                if (err) return errorHandler(err);
                // Process only once, if already processed discard
                if (resp[0]) {
                    sub.discard();
                } else {
                    let d = Math.random();
                    // 5% to error
                    if (d < 0.05) {
                        // Add error to Redis
                        self._writeError(message);
                        console.log(`ERROR PROCESSED ${message} by #${self.clientId}`);
                    } else console.log(`PROCESSED ${message} by #${self.clientId}`);
                }
            });
        sub.quit();
    }

    /**
     * Write error to Redis
     * @param message
     * @private
     */
    _writeError(message) {
        const sub = redis.createClient(config.redisPort[ENV]);

        sub.hmset("system.errors", message, +Date.now(), function (err) {
            if (err) return errorHandler(err);
        });

        sub.quit();
    }

    quit() {
        this.client.quit();
    }
}

module.exports = Worker;