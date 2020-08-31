import Pubnub from 'pubnub';
import Block from '../blockchain/Block';
import Blockchain from '../blockchain/Blockchain';
import Transaction from '../transaction/Transaction';
import TransactionQueue from '../transaction/TransactionQueue';

const credentials = {
  publishKey: 'pub-c-33d05494-7ae4-419e-9c3d-426d80015bb8',
  subscribeKey: 'sub-c-dd265dea-ea14-11ea-92d8-06a89e77181a',
  secretKey: 'sec-c-MDc4ZWI5MzAtZTkyMC00ZTA1LThmNzgtZWMwMDA2NmVlYWJh',
};

const CHANNELS_MAP = {
  TEST: 'TEST',
  BLOCK: 'BLOCK',
  TRANSACTION: 'TRANSACTION',
};

export default class Pubsub {
  pubNub: Pubnub;
  blockchain: Blockchain;
  transactionQueue: TransactionQueue;
  constructor({ blockchain, transactionQueue }) {
    this.pubNub = new Pubnub(credentials);
    this.subscribeToChannels();
    this.listen();
    this.blockchain = blockchain;
    this.transactionQueue = transactionQueue;
  }

  subscribeToChannels(): void {
    this.pubNub.subscribe({ channels: Object.values(CHANNELS_MAP) });
  }

  async publish({
    channel,
    message,
  }: {
    channel: string;
    message: string;
  }): Promise<void> {
    await this.pubNub.publish({ channel, message });
  }

  listen() {
    this.pubNub.addListener({
      message: async (messageEvent: Pubnub.MessageEvent) => {
        let { channel, message } = messageEvent;
        message = JSON.parse(message);
        switch (channel) {
          case CHANNELS_MAP.BLOCK:
            try {
              await this.blockchain.addBlock({
                block: message,
                transactionQueue: this.transactionQueue,
              });
              console.error(`New block accepted`, JSON.stringify(message));
            } catch (e) {
              console.error(`New block rejected`, e.message);
            }
            break;

          case CHANNELS_MAP.TRANSACTION:
            console.log(`Received transaction `, JSON.stringify(message));
            this.transactionQueue.add(new Transaction(message));
            break;

          default:
            break;
        }
      },
    });
  }

  async broadcastBlock(block: Block): Promise<void> {
    await this.publish({
      channel: CHANNELS_MAP.BLOCK,
      message: JSON.stringify(block),
    });
  }

  async broadcastTransaction(transaction: Transaction) {
    await this.publish({
      channel: CHANNELS_MAP.TRANSACTION,
      message: JSON.stringify(transaction),
    });
  }
}
