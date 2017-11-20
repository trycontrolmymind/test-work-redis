/**
 * Created by vd on 20.11.2017.
 */
const config = require('./config'),
    ENV = process.env.NODE_ENV;
const redis = require("redis"),
    client = redis.createClient(config.redisPort[ENV]);
const lorem = require("lorem-ipsum"),
      loremDefaults = {count: 3, units: "words"};

client.on("error", function (err) {
    console.log("Error " + err);
});

client.on("connect", function () {
    console.log("Connect " + lorem(loremDefaults));
});

client.set("string key", "string val", redis.print);
client.get("string key", function (err, reply) {
    console.log(err, reply); // => 'The connection has already been closed.'
});