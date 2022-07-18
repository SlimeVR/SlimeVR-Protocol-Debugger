import { PacketWithSensorId } from './Packet';

export class IncomingErrorPacket extends PacketWithSensorId {
  readonly reason: number;

  constructor(data: Buffer) {
    super(IncomingErrorPacket.type, data.readUintBE(0, 1) & 0xff);

    this.reason = data.readUintBE(1, 1);
  }

  static get type() {
    return 14;
  }

  override toString() {
    return `IncomingErrorPacket{sensorId: ${this.sensorId}, reason: ${this.reason}}`;
  }
}
