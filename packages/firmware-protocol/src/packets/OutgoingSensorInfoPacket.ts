import { SensorStatus } from '../constants';
import { PacketWithSensorId } from './Packet';

export class OutgoingSensorInfoPacket extends PacketWithSensorId {
  constructor(sensorId: number, readonly sensorStatus: SensorStatus) {
    super(OutgoingSensorInfoPacket.type, sensorId);
  }

  static get type() {
    return 15;
  }

  override toString() {
    return `OutgoingSensorInfoPacket{sensorId: ${this.sensorId}, sensorStatus: ${SensorStatus[this.sensorStatus]}}`;
  }

  encode() {
    const buffer = Buffer.alloc(6);
    buffer.writeInt32BE(OutgoingSensorInfoPacket.type, 0);
    buffer.writeUInt8(this.sensorId, 4);
    buffer.writeUInt8(this.sensorStatus, 5);
    return buffer;
  }
}
