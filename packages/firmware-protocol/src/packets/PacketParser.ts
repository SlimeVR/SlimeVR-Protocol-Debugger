import { IncomingAccelPacket } from './IncomingAccelPacket';
import { IncomingBatteryLevelPacket } from './IncomingBatteryLevelPacket';
import { IncomingCalibrationFinishedPacket } from './IncomingCalibrationFinishedPacket';
import { IncomingErrorPacket } from './IncomingErrorPacket';
import { IncomingGyroPacket } from './IncomingGyroPacket';
import { IncomingHandshakePacket } from './IncomingHandshakePacket';
import { IncomingHeartbeatPacket } from './IncomingHeartbeatPacket';
import { IncomingMagnetometerAccuracyPacket } from './IncomingMagnetometerAccuracy';
import { IncomingPongPacket } from './IncomingPongPacket';
import { IncomingRawCalibrationDataPacket } from './IncomingRawCalibrationDataPacket';
import { IncomingRotationDataPacket } from './IncomingRotationDataPacket';
import { IncomingRotationPacket } from './IncomingRotationPacket';
import { IncomingSensorInfoPacket } from './IncomingSensorInfoPacket';
import { IncomingSignalStrengthPacket } from './IncomingSignalStrengthPacket';
import { IncomingTapPacket } from './IncomingTapPacket';
import { IncomingTemperaturePacket } from './IncomingTemperaturePacket';
import { InspectionPacketParser } from './inspection/PacketParser';

export type TrackerLike = {
  getIP(): string;
  getPort(): number;

  getCurrentPacketNumber(): bigint;
  isNextPacket(v: bigint): boolean;
};

export const parse = (data: Buffer, tracker: TrackerLike) => {
  const type = data.readInt32BE();
  const number = data.readBigInt64BE(4);

  if (!tracker.isNextPacket(number)) {
    console.log(
      `Invalid sequence: ${tracker.getIP()}:${tracker.getPort()} - ${tracker.getCurrentPacketNumber()} ${number}`
    );

    return null;
  }

  data = data.slice(12);

  switch (type) {
    case IncomingHeartbeatPacket.type:
      return new IncomingHeartbeatPacket();

    case IncomingRotationPacket.type:
      return new IncomingRotationPacket(data);

    case IncomingGyroPacket.type:
      return new IncomingGyroPacket(data);

    case IncomingHandshakePacket.type:
      return new IncomingHandshakePacket(data);

    case IncomingAccelPacket.type:
      return new IncomingAccelPacket(data);

    case IncomingRawCalibrationDataPacket.type:
      return new IncomingRawCalibrationDataPacket(data);

    case IncomingCalibrationFinishedPacket.type:
      return new IncomingCalibrationFinishedPacket(data);

    case IncomingPongPacket.type:
      return new IncomingPongPacket(data);

    case IncomingBatteryLevelPacket.type:
      return new IncomingBatteryLevelPacket(data);

    case IncomingTapPacket.type:
      return new IncomingTapPacket(data);

    case IncomingErrorPacket.type:
      return new IncomingErrorPacket(data);

    case IncomingSensorInfoPacket.type:
      return new IncomingSensorInfoPacket(data);

    case IncomingRotationDataPacket.type:
      return new IncomingRotationDataPacket(data);

    case IncomingMagnetometerAccuracyPacket.type:
      return new IncomingMagnetometerAccuracyPacket(data);

    case IncomingSignalStrengthPacket.type:
      return new IncomingSignalStrengthPacket(data);

    case IncomingTemperaturePacket.type:
      return new IncomingTemperaturePacket(data);

    case InspectionPacketParser.type:
      return InspectionPacketParser.parseRawDataPacket(data);

    default:
      console.log(`Unknown packet type: ${type}`);
  }

  return null;
};
