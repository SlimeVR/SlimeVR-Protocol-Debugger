import { PacketWithSensorId } from './Packet';

export class IncomingMagnetometerAccuracyPacket extends PacketWithSensorId {
  readonly accuracy: number;

  constructor(data: Buffer) {
    super(IncomingMagnetometerAccuracyPacket.type, data.readUintBE(0, 1) & 0xff);

    this.accuracy = data.readFloatBE(1);
  }

  static get type() {
    return 18;
  }

  override toString() {
    return `IncomingMagnetometerAccuracyPacket{sensorId: ${this.sensorId}, accuracy: ${this.accuracy}}`;
  }
}
