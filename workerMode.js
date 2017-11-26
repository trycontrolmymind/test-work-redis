/**
 * Created by vd on 23.11.2017.
 */
const config = require('./config'),
    ENV = process.env.NODE_ENV;
const redis = require("redis");
const errorHandler = require("./errorHandler");

class Worker {
    constructor(onNoMsgCallback) {
        this.client = redis.createClient(config.redisPort[ENV]);
        this._latestMsgTime = +Date.now();
        this.onNoMsgCallback = onNoMsgCallback ? onNoMsgCallback : function () {
        };
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
            this._latestMsgTime = +Date.now();
            let d = Math.random();
            // 5% to error
            if (d < 0.05) {
                console.error(message);
                this._writeError(message);
            }
            console.log(message);
            // Add error to Redis
        });
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