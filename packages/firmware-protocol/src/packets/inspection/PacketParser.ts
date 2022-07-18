import { PacketType } from './constants';
import { IncomingCorrectionDataPacket } from './IncomingCorrectionDataPacket';
import { IncomingFusedIMUDataPacket } from './IncomingFusedIMUDataPacket';
import { IncomingRawIMUDataPacket } from './IncomingRawIMUDataPacket';

export class InspectionPacketParser {
  static parseRawDataPacket = (data: Buffer) => {
    const packetType = data.readUInt8(0);

    data = data.slice(1);

    switch (packetType) {
      case PacketType.RAW:
        return new IncomingRawIMUDataPacket(data);

      case PacketType.FUSED:
        return new IncomingFusedIMUDataPacket(data);

      case PacketType.CORRECTION:
        return new IncomingCorrectionDataPacket(data);

      default:
        console.log(`Unknown packet type: ${PacketType}`);
    }

    return null;
  };

  static get type() {
    return 0x69;
  }
}
