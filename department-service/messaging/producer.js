const stompit = require('stompit');

const getConnectOptions = () => ({
  host: process.env.ACTIVEMQ_HOST || 'activemq',
  port: parseInt(process.env.ACTIVEMQ_PORT || '61613', 10),
  connectHeaders: {
    host: '/',
    login: process.env.ACTIVEMQ_USER || 'admin',
    passcode: process.env.ACTIVEMQ_PASS || 'admin',
    'heart-beat': '5000,5000'
  }
});

function publish(topicName, eventType, payload) {
  return new Promise((resolve, reject) => {
    stompit.connect(getConnectOptions(), (connectError, client) => {
      if (connectError) {
        console.error('[Department-Producer] Connection error:', connectError.message);
        return reject(connectError);
      }

      const message = JSON.stringify({ eventType, payload, timestamp: new Date().toISOString() });
      const sendHeaders = {
        destination: `/topic/${topicName}`,
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(message)
      };

      const frame = client.send(sendHeaders);
      frame.write(message);
      frame.end();

      client.disconnect();
      console.log(`[Department-Producer] Published ${eventType} to /topic/${topicName}`);
      resolve();
    });
  });
}

module.exports = { publish };
