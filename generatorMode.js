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

let onQuitGenCb = function () {
};

function start(clientId, onQuitGeneratorMode) {
    if (onQuitGeneratorMode) onQuitGenCb = onQuitGeneratorMode;
    // Immediate set message generator to prevent duplicate generators
    client.get("message-generator", function (err, reply) {
        if (err) return errorHandler(err);
        if (reply && reply !== clientId) {
            clearTimeout(timerId);
            quit();
        }
    });

    client.set("message-generator", clientId, "EX", Math.round(config.keepAliveTimeout[ENV] / 1000));
    client.publish(config.channelName[ENV], lorem(loremDefaults));

    // Send message's with verified time
    let timerId = setTimeout(function tick() {
        // Save latest message generated
        client.set("message-generator", clientId, "EX", Math.round(config.keepAliveTimeout[ENV] / 1000));
        client.publish(config.channelName[ENV], lorem(loremDefaults));
        timerId = setTimeout(tick, config.messagePerMs[ENV]);
    }, config.messagePerMs[ENV]);

}

function quit() {
    client.quit();
    onQuitGenCb()
}

exports.start = start;
