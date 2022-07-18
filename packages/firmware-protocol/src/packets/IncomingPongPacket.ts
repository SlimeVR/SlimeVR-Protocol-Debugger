import { Packet } from './Packet';

export class IncomingPongPacket extends Packet {
  readonly id: number;

  constructor(data: Buffer) {
    super(IncomingPongPacket.type);

    this.id = data.readInt32BE(0);
  }

  static get type() {
    return 10;
  }

  override toString() {
    return `IncomingPongPacket{id: ${this.id}}`;
  }
}
