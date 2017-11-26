/**
 * Created by vd on 22.11.2017.
 */
const config = require('./config'),
    ENV = process.env.NODE_ENV || "dev";
const lorem = require("lorem-ipsum"),
    loremDefaults = {count: 3, units: "words"};
const redis = require("redis"),
    client = redis.createClient(config.redisPort[ENV]);
const errorHandler = require("./errorHandler");

let onQuitGenCb = function () {
};

/**
 * Start Generator Mode,
 * @param {number} clientId
 * @param {function} onQuitGeneratorMode - function If Generator already exists call
 */
function start(clientId, onQuitGeneratorMode) {
    if (onQuitGeneratorMode) onQuitGenCb = onQuitGeneratorMode;
    // Immediate set message generator to prevent duplicate generators
    client.multi()
        .get("message-generator")
        .set("message-generator", clientId, "EX", Math.round(config.keepAliveTimeout[ENV] / 1000))
        .publish(config.channelName[ENV], lorem(loremDefaults))
        .exec((err, reply) => {
            // if we already have generator, do nothing
            if (reply[0] && reply[0] !== clientId) {
                client.discard();
                clearTimeout(timerId);
                quit();
            }
            if (err) return errorHandler(err);
        });

    // Send message's with verified time
    let timerId = setTimeout(function tick() {
        // Save latest message generated
        client.multi()
            .set("message-generator", clientId, "EX", Math.round(config.keepAliveTimeout[ENV] / 1000))
            .publish(config.channelName[ENV], lorem(loremDefaults))
            .exec((err) => {
                if(err) return errorHandler(err)
            });
        timerId = setTimeout(tick, config.messagePerMs[ENV]);
    }, config.messagePerMs[ENV]);

}

function quit() {
    client.quit();
    onQuitGenCb()
}

exports.start = start;
