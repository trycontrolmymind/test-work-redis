/**
 * Created by vd on 20.11.2017.
 */
const config = require('./config'),
    ENV = process.env.NODE_ENV;
const redis = require("redis");
const client = redis.createClient(config.redisPort[ENV]);
const errorHandler = require("./errorHandler");
const generatorMode = require("./generatorMode"),
    CommonClient = require("./commonClient"),
    WorkerMode = require("./workerMode");

const myClient = new CommonClient();

// Send keepalive messages to know, what client's is online now
setInterval(function () {
    myClient.sendKeepalive();
}, config.keepAliveTimeout[ENV]);

const worker = new WorkerMode(onNoMessages);

function onNoMessages(timeout) {
    console.log(`No message's from generator after ${timeout}ms`);
    // Get all client's online
    // Make new generator from the elder client
}

client.subscribe(config.channelName[ENV]);

client.on("error", errorHandler);
