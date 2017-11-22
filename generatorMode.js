/**
 * Created by vd on 22.11.2017.
 */
const config = require('./config'),
    ENV = process.env.NODE_ENV;
const lorem = require("lorem-ipsum"),
    loremDefaults = {count: 3, units: "words"};
const redis = require("redis"),
    client = redis.createClient(config.redisPort[ENV]);
const errorHandler = require("./errorHandler");

function start() {
    // Immediate set message generator to prevent duplicate generators
    client.set("message-generator", +Date.now());

    // Send message's with verified time
    let timerId = setTimeout(function tick() {
        // Save latest message generated
        client.set("message-generator", +Date.now(), function (err) {
            if (err) errorHandler(err);
        });
        client.publish(config.channelName[ENV], lorem(loremDefaults));
        timerId = setTimeout(tick, config.messagePerMs[ENV]);
    }, config.messagePerMs[ENV]);

}

exports.start = start;
