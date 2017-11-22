/**
 * Created by vd on 20.11.2017.
 */
const config = require('./config'),
    ENV = process.env.NODE_ENV;
const redis = require("redis"),
    client = redis.createClient(config.redisPort[ENV]);
const lorem = require("lorem-ipsum"),
      loremDefaults = {count: 3, units: "words"};
const clientNumber = Math.round(Math.random()*10000);

// If args is "getErrors" pop all messages
// Print Errors and exit

client.on("error", function (err) {
    // Add error to DB
});

client.on("connect", () => {
    // Check if generator exists
    // Check if generator keep alive
    console.info(`Connect client #${clientNumber}`)
});

client.on("message", function (channel, count) {
    // 5% to error and throw Error

    // Emulate message processing
    console.log(`${count} client join channel ${channel}`);
});
// If channel not exist, create channel
client.publish("application-channel", "mess");

// Join channel
client.subscribe("application-channel");