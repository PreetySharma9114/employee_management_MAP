const stompit = require('stompit');
const Attendance = require('../models/Attendance');

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

function handleEvent(eventType, payload) {
  switch (eventType) {
    case 'employee.deleted':
      const count = Attendance.deleteByEmployeeId(payload.id);
      console.log(`[Attendance-Consumer] Removed ${count} attendance records for deleted employee ${payload.id}`);
      break;
    default:
      console.log(`[Attendance-Consumer] Unhandled event: ${eventType}`);
  }
}

function startConsumer() {
  const reconnectOptions = {
    initialReconnectDelay: 1000,
    maxReconnectDelay: 10000,
    useExponentialBackOff: true,
    maxReconnects: 10,
    randomize: false
  };

  const manager = new stompit.ConnectFailover(
    [getConnectOptions()],
    reconnectOptions
  );

  manager.connect((connectError, client, reconnect) => {
    if (connectError) {
      console.error('[Attendance-Consumer] Fatal connection error:', connectError.message);
      return;
    }

    client.on('error', (err) => {
      console.error('[Attendance-Consumer] Client error:', err.message);
      reconnect();
    });

    const subscribeHeaders = {
      destination: '/topic/employee.events',
      ack: 'client-individual'
    };

    client.subscribe(subscribeHeaders, (subscribeError, message) => {
      if (subscribeError) {
        console.error('[Attendance-Consumer] Subscribe error:', subscribeError.message);
        return;
      }

      message.readString('utf-8', (readError, body) => {
        if (readError) {
          console.error('[Attendance-Consumer] Read error:', readError.message);
          client.ack(message);
          return;
        }
        try {
          const { eventType, payload } = JSON.parse(body);
          handleEvent(eventType, payload);
        } catch (err) {
          console.error('[Attendance-Consumer] Parse error:', err.message);
        }
        client.ack(message);
      });
    });

    console.log('[Attendance-Consumer] Subscribed to /topic/employee.events');
  });
}

module.exports = { startConsumer };
