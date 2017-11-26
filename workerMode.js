/**
 * Created by vd on 23.11.2017.
 */
const config = require('./config'),
    ENV = process.env.NODE_ENV;
const redis = require("redis");
const errorHandler = require("./errorHandler");

class Worker {
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

    _onMessage() {
        this.client.on("message", (channel, message) => {
            this._processMessage.apply(this, [message])
        });
    }

    _processMessage(message) {
        const self = this;
        this._latestMsgTime = +Date.now();
        const sub = redis.createClient(config.redisPort[ENV]);

        sub.multi().get(message).set(message, self.clientId).exec(function (err, resp) {
            if (err) return errorHandler(err);
            // Process only once
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