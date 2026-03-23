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

const TOPICS = [
  '/topic/employee.events',
  '/topic/leave.events',
  '/topic/attendance.events',
  '/topic/department.events',
  // OTP login flow (queue destination)
  '/queue/auth.otp'
];

function formatNotification(eventType, payload) {
  const templates = {
    'employee.created': `NEW EMPLOYEE: ${payload.name} (${payload.email}) joined the ${payload.department} department.`,
    'employee.updated': `EMPLOYEE UPDATED: Record for ${payload.name} (ID: ${payload.id}) has been modified.`,
    'employee.deleted': `EMPLOYEE REMOVED: Employee ID ${payload.id} (${payload.name}) has been deleted.`,
    'leave.created': `LEAVE REQUEST: Employee ${payload.employeeId} submitted a ${payload.type} leave from ${payload.startDate} to ${payload.endDate}.`,
    'leave.approved': `LEAVE APPROVED: Leave request ${payload.id} for employee ${payload.employeeId} has been approved.`,
    'leave.rejected': `LEAVE REJECTED: Leave request ${payload.id} for employee ${payload.employeeId} has been rejected.`,
    'leave.deleted': `LEAVE CANCELLED: Leave request ${payload.id} has been deleted.`,
    'attendance.checkin': `CHECK-IN: Employee ${payload.employeeId} checked in at ${payload.checkIn} on ${payload.date}.`,
    'attendance.checkout': `CHECK-OUT: Employee ${payload.employeeId} checked out at ${payload.checkOut} after ${payload.hoursWorked}h on ${payload.date}.`,
    'department.created': `NEW DEPARTMENT: "${payload.name}" department has been created with a budget of $${payload.budget}.`,
    'department.updated': `DEPARTMENT UPDATED: "${payload.name}" (ID: ${payload.id}) has been modified.`,
    'department.deleted': `DEPARTMENT REMOVED: Department "${payload.name}" (ID: ${payload.id}) has been deleted.`,
    'otp.generated': `OTP GENERATED (dev/local): ${payload.email} - otp=${payload.otp} (expiresAt=${payload.expiresAt})`
  };

  return templates[eventType] || `EVENT [${eventType}]: ${JSON.stringify(payload)}`;
}

function subscribeToTopic(client, topic, reconnect) {
  const subscribeHeaders = {
    destination: topic,
    ack: 'client-individual'
  };

  client.subscribe(subscribeHeaders, (subscribeError, message) => {
    if (subscribeError) {
      console.error(`[Notification-Consumer] Subscribe error on ${topic}:`, subscribeError.message);
      if (reconnect) reconnect();
      return;
    }

    message.readString('utf-8', (readError, body) => {
      if (readError) {
        console.error(`[Notification-Consumer] Read error on ${topic}:`, readError.message);
        if (reconnect) reconnect();
        return;
      }

      try {
        const { eventType, payload, timestamp } = JSON.parse(body);
        const notification = formatNotification(eventType, payload);

        // In production this would dispatch to email/SMS/push notification provider
        console.log(`\n[NOTIFICATION] [${timestamp}]`);
        console.log(`  Topic  : ${topic}`);
        console.log(`  Event  : ${eventType}`);
        console.log(`  Message: ${notification}\n`);
      } catch (err) {
        console.error(`[Notification-Consumer] Parse error on ${topic}:`, err.message);
      }

      client.ack(message);
    });
  });
}

function startConsumer() {
  const reconnectOptions = {
    initialReconnectDelay: 1000,
    maxReconnectDelay: 15000,
    useExponentialBackOff: true,
    maxReconnects: -1,
    randomize: false
  };

  const manager = new stompit.ConnectFailover(
    [getConnectOptions()],
    reconnectOptions
  );

  manager.connect((connectError, client, reconnect) => {
    if (connectError) {
      console.error('[Notification-Consumer] Fatal connection error:', connectError.message);
      return;
    }

    client.on('error', (err) => {
      console.error('[Notification-Consumer] Client error:', err.message);
      reconnect();
    });

    TOPICS.forEach((topic) => subscribeToTopic(client, topic, reconnect));
    console.log(`[Notification-Consumer] Subscribed to ${TOPICS.length} destinations`);
  });
}

module.exports = { startConsumer };
