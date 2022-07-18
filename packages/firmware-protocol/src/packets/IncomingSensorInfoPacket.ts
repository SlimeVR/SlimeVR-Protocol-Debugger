import { SensorStatus, SensorType } from '../constants';
import { PacketWithSensorId } from './Packet';

export class IncomingSensorInfoPacket extends PacketWithSensorId {
  readonly sensorStatus: SensorStatus;
  readonly sensorType: SensorType;

  constructor(data: Buffer) {
    super(IncomingSensorInfoPacket.type, data.readUintBE(0, 1) & 0xff);

    this.sensorStatus = data.readUintBE(1, 1) & 0xff;

    this.sensorType = SensorType.UNKNOWN;

    if (data.length >= 3) {
      this.sensorType = data.readUintBE(2, 1) & 0xff;
    }
  }

  static get type() {
    return 15;
  }

  static encode(sensorId: number, sensorStatus: SensorStatus, sensorType: SensorType): Buffer {
    const buf = Buffer.alloc(3);
    buf.writeUintBE(sensorId, 0, 1);
    buf.writeUintBE(sensorStatus, 1, 1);
    buf.writeUintBE(sensorType, 2, 1);
    return buf;
  }

  override toString() {
    return `IncomingSensorInfoPacket{sensorId: ${this.sensorId}, sensorStatus: ${
      SensorStatus[this.sensorStatus]
    }, sensorType: ${SensorType[this.sensorType]}}`;
  }
}
