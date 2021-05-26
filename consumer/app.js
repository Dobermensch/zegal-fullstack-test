const cors = require('cors');
const express = require("express");
const app = express();
app.use(cors());
app.options('*', cors());
const http = require("http").createServer(app);
const path = require("path");
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"]
  }
});
const port = process.env.PORT || 5000;

let q = 'my-queue';
let amqp = require('amqp-connection-manager');

let main = async (io) => {

    var connection = amqp.connect([
        'amqp://rabbitmq:5672',
    ]);

    var channelWrapper = connection.createChannel({
        json: true,
        setup: function(channel) {
            return channel.assertQueue(q, { durable: true });
        }
    });

    channelWrapper.addSetup(function(channel) {
        return Promise.all([
            channel.consume(q, (msg) => {
                const data = JSON.parse(msg.content.toString()); 
                console.log('received ' + data.message);
                if (data.priority >= 7) {
                  io.emit("consumer_push_message", data);
                }
            }, {noAck: true , exclusive: false })
        ])
    });
}

io.on("connection", function(socket) {
  let clientCount = io.sockets.server.engine.clientsCount;
  console.log('someone connected!');

  // On client disconnect
  socket.on("disconnect", function() {
    console.log('someone left');
  });
});

main(io);

// start server
http.listen(port, (req, res) => {
  console.log(`server listening on port: ${port}`);
});