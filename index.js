/**
 * Created by vd on 20.11.2017.
 */
const config = require('./config'),
    ENV = process.env.NODE_ENV;
const redis = require("redis"),
    client = redis.createClient(config.redisPort[ENV]);

client.on("error", function (err) {
    console.log("Error " + err);
});

client.on("connect", function (err) {
    console.log("Error " + err);
});

client.set("string key", "string val", redis.print);
client.get("string key", function (err, reply) {
    console.log(err, reply); // => 'The connection has already been closed.'
});