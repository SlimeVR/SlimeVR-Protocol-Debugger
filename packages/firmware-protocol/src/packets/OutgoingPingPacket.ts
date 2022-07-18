import { Packet } from './Packet';

export class OutgoingPingPacket extends Packet {
  constructor(readonly id: number) {
    super(OutgoingPingPacket.type);
  }

  static get type() {
    return 10;
  }

  override toString() {
    return `OutgoingPingPacket{id: ${this.id}}`;
  }

  encode() {
    const buf = Buffer.alloc(16);
    buf.writeInt32BE(this.type, 0);
    buf.writeBigInt64BE(0n, 4);
    buf.writeInt32BE(this.id, 12);
    return buf;
  }
}
