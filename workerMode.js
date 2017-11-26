/**
 * Created by vd on 23.11.2017.
 */
const config = require('./config'),
    ENV = process.env.NODE_ENV;
const redis = require("redis"),
    client = redis.createClient(config.redisPort[ENV]);
const errorHandler = require("./errorHandler");

class Worker {
    constructor(onNoMsgCallback) {
        this._latestMsgTime = +Date.now();
        this.onNoMsgCallback = onNoMsgCallback ? onNoMsgCallback : function () {
        };
        this._checkMessages();
        this._onMessage();
    }

    _checkMessages() {
        const self = this;
        let timerId = setTimeout(function haveMessages() {
            let msgTimeoutMs = (+Date.now()) - self._latestMsgTime;
            if (msgTimeoutMs > config.keepAliveTimeout[ENV]) {
                return self.onNoMsgCallback(msgTimeoutMs);
            }
            timerId = setTimeout(haveMessages, config.keepAliveTimeout[ENV]);
        }, config.keepAliveTimeout[ENV]);
    }

    _onMessage() {
        client.on("message", function () {
            this._latestMsgTime = +Date.now();
            // 5% to error
            // Add error to Redis

        });
    }
}

module.exports = Worker;