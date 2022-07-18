import { PacketWithSensorId } from './Packet';

export class IncomingSignalStrengthPacket extends PacketWithSensorId {
  readonly signalStrength: number;

  constructor(data: Buffer) {
    super(IncomingSignalStrengthPacket.type, data.readUintBE(0, 1) & 0xff);

    this.signalStrength = data.readUintBE(1, 1);
  }

  static get type() {
    return 19;
  }

  override toString() {
    return `IncomingSignalStrengthPacket{sensorId: ${this.sensorId}, signalStrength: ${this.signalStrength}}`;
  }
}
