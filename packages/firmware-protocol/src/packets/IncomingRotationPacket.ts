import { Quaternion } from '@slimevr/common';
import { Packet } from './Packet';

export class IncomingRotationPacket extends Packet {
  readonly rotation: Quaternion;

  constructor(data: Buffer) {
    super(IncomingRotationPacket.type);

    this.rotation = [data.readFloatBE(0), data.readFloatBE(4), data.readFloatBE(8), data.readFloatBE(12)];
  }

  static get type() {
    return 1;
  }

  override toString() {
    return `IncomingRotationPacket{rotation: ${this.rotation}}`;
  }
}
