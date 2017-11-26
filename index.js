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

const commonClient = new CommonClient();
const CLIENT_ID = commonClient.clientNumber;
// Send keepalive messages to know, what client's is online now
commonClient.sendKeepalive();
let timerId = setTimeout(function tick() {
    commonClient.sendKeepalive();
    timerId = setTimeout(tick, config.keepAliveTimeout[ENV]);
}, config.keepAliveTimeout[ENV]);

let worker = new WorkerMode(onNoMessages, CLIENT_ID);

function onNoMessages(timeout) {
    console.log(`No message's from generator after ${timeout}ms`);
    // Get all client's online
    commonClient.getAllClientsOnline(function (reply) {
        const newGeneratorId = commonClient.getNewGenerator(reply);
        console.log(`New generator will be #${newGeneratorId}`);
        startGeneratorOrWorker(newGeneratorId);
    });

    function startGeneratorOrWorker(generatorId) {
        // Make new generator from the elder client
        // Make listener's from other client's
        if (generatorId === CLIENT_ID) {
            generatorMode.start(CLIENT_ID, function () {
                worker = new WorkerMode(onNoMessages, CLIENT_ID);
            });
        } else {
            worker = new WorkerMode(onNoMessages, CLIENT_ID);
        }
    }
}

client.subscribe(config.channelName[ENV]);

client.on("error", errorHandler);
