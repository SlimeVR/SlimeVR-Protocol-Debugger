import { Packet } from './Packet';

export class IncomingHeartbeatPacket extends Packet {
  constructor() {
    super(IncomingHeartbeatPacket.type);
  }

  static get type() {
    return 0;
  }

  override toString() {
    return 'IncomingHeartbeatPacket{}';
  }
}
