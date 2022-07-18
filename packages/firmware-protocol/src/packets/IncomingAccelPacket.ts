import { Vector } from '@slimevr/common';
import { Packet } from './Packet';

export class IncomingAccelPacket extends Packet {
  readonly acceleration: Vector;

  constructor(data: Buffer) {
    super(IncomingAccelPacket.type);

    this.acceleration = [data.readFloatBE(0), data.readFloatBE(4), data.readFloatBE(8)];
  }

  static get type() {
    return 4;
  }

  override toString() {
    return `IncomingAccelPacket{acceleration: ${this.acceleration}}`;
  }
}
