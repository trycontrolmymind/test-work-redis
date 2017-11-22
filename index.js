/**
 * Created by vd on 20.11.2017.
 */
const config = require('./config'),
    ENV = process.env.NODE_ENV;
const redis = require("redis"),
    client = redis.createClient(config.redisPort[ENV]);
const lorem = require("lorem-ipsum"),
    loremDefaults = {count: 3, units: "words"};
const clientNumber = Math.round(Math.random() * 10000);

// If args is "getErrors" pop all messages
// Print Errors and exit

client.on("error", function (err) {
    // Add error to DB
});

client.on("subscribe", (channel) => {
    if(channel !== config.channelName[ENV]) return;
    // Check if generator exists
    console.log(`Subscribe client #${clientNumber}`);

    client.get("message-generator", (err, reply) => {
        if (err) {
            // Start generator mode
        }
        if (typeof reply === 'number' && (reply % 1) === 0) {
            // Start generator mode
        }
        // Check if generator keep alive
        let currentTimestamp = +new Date();
        if (currentTimestamp - reply > config.messagePerMs[ENV]) {
            // Start generator mode
        } else {
            // Start worker mode
        }
    });
});

// Join channel to isolate
client.subscribe(config.channelName[ENV]);
