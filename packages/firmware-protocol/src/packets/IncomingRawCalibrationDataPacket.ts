import { Vector } from '@slimevr/common';
import { RawCalibrationDataType } from '../constants';
import { PacketWithSensorId } from './Packet';

export class IncomingRawCalibrationDataPacket extends PacketWithSensorId {
  readonly dataType: RawCalibrationDataType;
  readonly data: Vector;

  constructor(data: Buffer) {
    super(IncomingRawCalibrationDataPacket.type, data.readUintBE(0, 1) & 0xff);

    this.dataType = data.readInt32BE(1);

    this.data = [data.readFloatBE(5), data.readFloatBE(9), data.readFloatBE(13)];
  }

  static get type() {
    return 6;
  }

  override toString() {
    return `IncomingRawCalibrationDataPacket{sensorId: ${this.sensorId}, dataType: ${
      RawCalibrationDataType[this.dataType]
    }, data: ${this.data}}`;
  }
}
