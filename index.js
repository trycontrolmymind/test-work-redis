/**
 * Created by vd on 20.11.2017.
 */
const config = require('./config'),
    ENV = process.env.NODE_ENV;
const redis = require("redis");
const client = redis.createClient(config.redisPort[ENV]);
const generatorMode = require("./generatorMode");
const errorHandler = require("./errorHandler");

// If args is "getErrors" pop all messages
// Print Errors and exit

client.on("error", errorHandler);

client.get("message-generator", (err, reply) => {
    // If has error, don't stop
    if (err) errorHandler(err);
    // If no reply OR keepalive signal was 500*2ms ago
    if (reply === null ||
        (typeof reply === 'number' && (reply % 1) === 0) ||
        (+new Date() - reply > config.messagePerMs[ENV] * 2)) {
        // Start generator mode
        generatorMode.start();
    } else {
        // Start worker mode
    }
    client.quit();
});

// Join channel to isolate
client.subscribe(config.channelName[ENV]);
