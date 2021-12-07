import amqp from 'amqplib';
import config from '../configs';

export default class MessageQueueService {
  static channel;

  static queueName;

  constructor(queueName = config.amqp.queueSCEvent) {
    this.queueName = queueName;
  }

  async connect() {
    try {
      const connectRabbitMQ = amqp.connect(
        `amqp://${config.amqp.username}:${config.amqp.password}@${config.amqp.host}:${config.amqp.port}`
      );
      this.channel = await connectRabbitMQ
        .then(conn => conn.createChannel())
        .then(ch => ch);
      // durable:true - means the queue definition will survive a server restart
      await this.channel.assertQueue(this.queueName, { durable: true });
    } catch (e) {
      console.error('Connect to RabbitMQ Error: ', e);
      process.exit();
    }
  }

  async checkQueue() {
    try {
      return await this.channel.assertQueue(this.queueName);
    } catch (e) {
      console.error('Count message error: %j', e);
      return Promise.reject(e);
    }
  }

  async producerJob(data) {
    try {
      // deliveryMode:2 - make message persistent
      await this.channel.sendToQueue(this.queueName, Buffer.from(JSON.stringify(data)), {
        deliveryMode: 2
      });
      return Promise.resolve(true);
    } catch (e) {
      console.error('Producer job error: %j', e);
      return Promise.reject(e);
    }
  }

  async consumerJob(executeFunction) {
    try {
      await this.channel.prefetch(1);
      await this.channel.consume(this.queueName, res => executeFunction(res, this.channel), { noAck: false });
      return Promise.resolve(true);
    } catch (e) {
      console.error('Consumer job error: %j', e);
      return Promise.reject(e);
    }
  }
}
