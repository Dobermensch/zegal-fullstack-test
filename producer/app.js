var amqp = require('amqplib/callback_api');

const url = 'amqp://rabbitmq';
const queue = 'my-queue';

const phrases = ['Lovey Dovey',
                 'Back to Square One',
                 'Jack of All Trades Master of None',
                 'A Dime a Dozen',
                 'Foaming At The Mouth',
                 'Closer To The Edge',
                 'Par For the Course',
                 'Playing Possum',
                 'Fish Out Of Water',
                 'A Life Unlived']

function sleep(ms) {
  if(ms <= 0){
    return
  }
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function start() {
  if (channel) {

    const date = Date;

    while (true) {
      const priority = Math.floor((Math.random() * 10) + 1)

      const obj = {
        message: phrases[Math.floor((Math.random() * 10))],
        timestamp: date.now(),
        priority: priority
      }

      await channel.sendToQueue(queue, new Buffer.from(JSON.stringify(obj)));
      await sleep(50);
      console.log(`sent ${obj.priority}`);
    }
  }
}

let channel = null;
amqp.connect(url, function (err, conn) {
  if (!conn) {
    throw new Error(`AMQP connection not available on ${url}`);
  }
  conn.createChannel(function (err, ch) {
    channel = ch;
    start();
  });
});

process.on('exit', code => {
    channel.close();
    console.log(`Closing`);
});