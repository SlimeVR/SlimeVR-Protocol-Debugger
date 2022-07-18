import { Quaternion } from '@slimevr/common';
import { PacketWithSensorId } from './Packet';

export enum RotationDataType {
  NORMAL = 1,
  CORRECTION = 2
}

export class IncomingRotationDataPacket extends PacketWithSensorId {
  readonly dataType: RotationDataType;

  readonly rotation: Quaternion;

  constructor(data: Buffer) {
    super(IncomingRotationDataPacket.type, data.readUintBE(0, 1) & 0xff);

    this.dataType = data.readUintBE(1, 1) & 0xff;

    this.rotation = [data.readFloatBE(2), data.readFloatBE(6), data.readFloatBE(10), data.readFloatBE(14)];
  }

  static get type() {
    return 17;
  }

  override toString() {
    return `IncomingRotationDataPacket{sensorId: ${this.sensorId}, dataType: ${
      RotationDataType[this.dataType]
    }, rotation: ${this.rotation}}`;
  }
}
