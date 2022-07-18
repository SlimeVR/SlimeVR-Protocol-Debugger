import { Quaternion } from '@slimevr/common';
import { Packet } from '../Packet';
import { DataType } from './constants';

export class IncomingFusedIMUDataPacket extends Packet {
  readonly sensorId: number;
  readonly quaternion: Quaternion;

  constructor(data: Buffer) {
    super(IncomingFusedIMUDataPacket.type);

    this.sensorId = data.readUInt8(0);

    if (data.readUintBE(1, 1) !== DataType.FLOAT) {
      throw new Error('IncomingFusedIMUDataPacket: data type must be float');
    }

    this.quaternion = [data.readFloatBE(2), data.readFloatBE(6), data.readFloatBE(10), data.readFloatBE(14)];
  }

  static get type() {
    return 0x6902;
  }

  override toString() {
    return `IncomingFusedIMUDataPacket{sensorId: ${this.sensorId}, quaternion: ${this.quaternion}}`;
  }
}
