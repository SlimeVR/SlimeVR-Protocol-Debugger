import { Packet } from './Packet';

export class IncomingBatteryLevelPacket extends Packet {
  readonly voltage: number;
  readonly percentage: number;

  constructor(data: Buffer) {
    super(IncomingBatteryLevelPacket.type);

    this.voltage = 0;

    const tmp = data.readFloatBE(0);
    data = data.slice(4);

    if (data.length >= 4) {
      this.percentage = data.readFloatBE(0) * 100;
      this.voltage = tmp;
    } else {
      this.percentage = tmp;
    }
  }

  static get type() {
    return 12;
  }

  override toString() {
    return `IncomingBatteryLevelPacket{voltage: ${this.voltage}, percentage: ${this.percentage}}`;
  }
}
