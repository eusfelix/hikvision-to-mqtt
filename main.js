var net = require('net');
var xml2js = require('xml2js');
var mqtt = require('mqtt');
var parser = new xml2js.Parser();
var options = {
    host: 'your-camera-ip',
    port: '80',
    user: 'admin',
    pass: 'password',
    log: false,
};
var mqttoptions = {
    host: 'mqtt://mqtt.iotwithus.com',
    username: 'user',
    password: 'pass',
    topic: 'some-topic',
};
var mqttclient = mqtt.connect(mqttoptions.host, mqttoptions);
var postcount = 0;
var authHeader = 'Authorization: Basic ' + new Buffer(options.user + ':' + options.pass).toString('base64');
var client = net.connect(options, function () {
    var header = 'GET /ISAPI/Event/notification/alertStream HTTP/1.1\r\n' +
        'Host: ' + options.host + ':' + options.port + '\r\n' +
        authHeader + '\r\n' +
        'Accept: multipart/x-mixed-replace\r\n\r\n';
    client.write(header);
    client.setKeepAlive(true, 1000);
    console.log('Connected.');
});

client.on('data', function (data) {
    handleData(data);
});

function handleData(data) {
    parser.parseString(data, function (err, result) {
        if (result) {
            var event = {};
            event = result['EventNotificationAlert'];
            //console.log(event);
            if (postcount !== event.activePostCount[0]) {
                mqttclient.publish(mqttoptions.topic, JSON.stringify(event));
                postcount = event.activePostCount[0];
                console.log('['+event.dateTime[0] + '] Event sent !');
            }

        }
    })

}