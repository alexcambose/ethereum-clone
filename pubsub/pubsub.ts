import Pubnub from 'pubnub';
import Block from '../blockchain/Block';
import Blockchain from '../blockchain/Blockchain';

const credentials = {
  publishKey: 'pub-c-33d05494-7ae4-419e-9c3d-426d80015bb8',
  subscribeKey: 'sub-c-dd265dea-ea14-11ea-92d8-06a89e77181a',
  secretKey: 'sec-c-MDc4ZWI5MzAtZTkyMC00ZTA1LThmNzgtZWMwMDA2NmVlYWJh',
};

const CHANNELS_MAP = {
  TEST: 'TEST',
  BLOCK: 'BLOCK',
};

export default class Pubsub {
  pubNub: Pubnub;
  blockchain: Blockchain;
  constructor({ blockchain }) {
    this.pubNub = new Pubnub(credentials);
    this.subscribeToChannels();
    this.listen();
    this.blockchain = blockchain;
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
        const { channel, message } = messageEvent;

        switch (channel) {
          case CHANNELS_MAP.BLOCK:
            console.log(channel, message);

            const block = JSON.parse(message);
            try {
              await this.blockchain.addBlock({ block });
              console.error(`New block accepted`);
            } catch (e) {
              console.error(`New block rejected`, e.message);
            }
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
}
