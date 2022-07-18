import { PacketWithSensorId } from './Packet';

export class IncomingTemperaturePacket extends PacketWithSensorId {
  readonly temperature: number;

  constructor(data: Buffer) {
    super(IncomingTemperaturePacket.type, data.readUintBE(0, 1) & 0xff);

    this.temperature = data.readFloatBE(1);
  }

  static get type() {
    return 20;
  }

  override toString() {
    return `IncomingTemperaturePacket{sensorId: ${this.sensorId}, temperature: ${this.temperature}}`;
  }
}
