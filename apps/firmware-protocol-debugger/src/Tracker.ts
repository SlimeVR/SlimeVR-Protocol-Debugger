import {
  IncomingAccelPacket,
  IncomingBatteryLevelPacket,
  IncomingCalibrationFinishedPacket,
  IncomingCorrectionDataPacket,
  IncomingErrorPacket,
  IncomingFusedIMUDataPacket,
  IncomingGyroPacket,
  IncomingHandshakePacket,
  IncomingHeartbeatPacket,
  IncomingMagnetometerAccuracyPacket,
  IncomingPongPacket,
  IncomingRawCalibrationDataPacket,
  IncomingRawIMUDataPacket,
  IncomingRotationDataPacket,
  IncomingSensorInfoPacket,
  IncomingSignalStrengthPacket,
  IncomingTapPacket,
  IncomingTemperaturePacket,
  OutgoingHandshakePacket,
  OutgoingPingPacket,
  OutgoingSensorInfoPacket,
  PacketWithSensorId,
  parse,
  Protocol,
  SensorStatus,
  TrackerLike
} from '@slimevr/firmware-protocol';
import { Socket } from 'dgram';
import { createWriteStream, WriteStream } from 'fs';
import { ConnectionTracker } from './ConnectionTracker';
import { Sensor } from './Sensor';
import {
  correctionDataDumpFile,
  fusedIMUDataDumpFile,
  rawIMUDataDumpFile,
  rotationDataPacketDumpFile,
  shouldDumpAllPacketsRaw,
  shouldDumpCorrectionDataProcessed,
  shouldDumpCorrectionDataRaw,
  shouldDumpFusedDataProcessed,
  shouldDumpFusedDataRaw,
  shouldDumpRawIMUDataProcessed,
  shouldDumpRawIMUDataRaw,
  shouldDumpRotationDataPacketsProcessed,
  shouldDumpRotationDataPacketsRaw
} from './utils';
import { VectorAggregator } from './VectorAggretator';

export class Tracker implements TrackerLike {
  private _packetNumber = BigInt(0);
  private handshook = false;
  private lastPacket = Date.now();
  private lastPingId = 0;

  private _mac = '';
  private firmwareBuild = -1;
  private protocol = Protocol.UNKNOWN;

  private sensors: Sensor[] = [];
  private signalStrength = 0;
  private batteryVoltage = 0;
  private batteryPercentage = 0;

  private readonly rotation = new VectorAggregator(4);
  private readonly fusedRotation = new VectorAggregator(4);
  private readonly correctedRotation = new VectorAggregator(4);
  private readonly rawRotation = new VectorAggregator(3);
  private readonly rawAcceleration = new VectorAggregator(3);
  private readonly rawMagnetometer = new VectorAggregator(3);

  private readonly rotationDataPacketStream: WriteStream | null = null;
  private readonly rawIMUDataRawStream: WriteStream | null = null;
  private readonly fusedIMUDataRawStream: WriteStream | null = null;
  private readonly correctionDataRawStream: WriteStream | null = null;

  constructor(private server: Socket, private _ip: string, private _port: number) {
    if (rotationDataPacketDumpFile() !== '') {
      this.log(`Dumping rotation data to ${rotationDataPacketDumpFile()}`);

      this.rotationDataPacketStream = createWriteStream(rotationDataPacketDumpFile(), 'utf8');
      this.rotationDataPacketStream.write('timestamp,x,y,z,w\n');
    } else {
      this.rotationDataPacketStream = null;
    }

    if (rawIMUDataDumpFile() !== '') {
      this.log(`Dumping raw IMU data to ${rawIMUDataDumpFile()}`);

      this.rawIMUDataRawStream = createWriteStream(rawIMUDataDumpFile(), 'utf8');
      this.rawIMUDataRawStream.write('timestamp,rX,rY,rZ,rA,aX,aY,aZ,aAmX,mY,mZ,mA\n');
    } else {
      this.rawIMUDataRawStream = null;
    }

    if (fusedIMUDataDumpFile() !== '') {
      this.log(`Dumping fused IMU data to ${fusedIMUDataDumpFile()}`);

      this.fusedIMUDataRawStream = createWriteStream(fusedIMUDataDumpFile(), 'utf8');
      this.fusedIMUDataRawStream.write('timestamp,x,y,z,w\n');
    } else {
      this.fusedIMUDataRawStream = null;
    }

    if (correctionDataDumpFile()) {
      this.log(`Dumping correction data to ${correctionDataDumpFile()}`);

      this.correctionDataRawStream = createWriteStream(correctionDataDumpFile(), 'utf8');
      this.correctionDataRawStream.write('timestamp,x,y,z,w\n');
    } else {
      this.correctionDataRawStream = null;
    }
  }

  get alive() {
    return this.lastPacket > Date.now() - 1000;
  }

  private log(msg: string) {
    console.log(`[Tracker:${this._ip}] ${msg}`);
  }

  handle(msg: Buffer) {
    const packet = parse(msg, this);
    if (packet === null) {
      this.log(`Received unknown packet (${msg.length} bytes): ${msg.toString('hex')}`);

      return;
    }

    this.lastPacket = Date.now();

    if (shouldDumpAllPacketsRaw()) {
      this.log(packet.toString());
    }

    switch (packet.type) {
      case IncomingHeartbeatPacket.type: {
        this.log('Received heartbeat');

        break;
      }

      case IncomingGyroPacket.type: {
        const rot = packet as IncomingGyroPacket;

        this.log(`Gyroscope: ${rot.rotation.join(', ')}`);

        break;
      }

      case IncomingHandshakePacket.type: {
        const handshake = packet as IncomingHandshakePacket;

        this.firmwareBuild = handshake.firmwareBuild;
        this._mac = handshake.mac;
        this.protocol = handshake.firmware === '' ? Protocol.OWO_LEGACY : Protocol.SLIMEVR_RAW;

        const existingConnection = ConnectionTracker.get().getConnectionByMAC(handshake.mac);

        if (existingConnection) {
          this.log(`Removing existing connection for MAC ${handshake.mac}`);
          ConnectionTracker.get().removeConnectionByMAC(handshake.mac);
        }

        ConnectionTracker.get().addConnection(this);

        this.handshook = true;

        if (this.protocol === Protocol.OWO_LEGACY || this.firmwareBuild < 9) {
          const buf = IncomingSensorInfoPacket.encode(0, SensorStatus.OK, handshake.mcuType);

          this.handleSensorPacket(new IncomingSensorInfoPacket(buf));
        }

        this.server.send(new OutgoingHandshakePacket().encode(), this._port, this._ip);

        break;
      }

      case IncomingAccelPacket.type: {
        const accel = packet as IncomingAccelPacket;

        this.log(`Acceleration: ${accel.acceleration.join(', ')}`);

        break;
      }

      case IncomingRawCalibrationDataPacket.type: {
        const rawCalibrationData = packet as IncomingRawCalibrationDataPacket;

        this.handleSensorPacket(rawCalibrationData);

        break;
      }

      case IncomingCalibrationFinishedPacket.type: {
        const calibrationFinished = packet as IncomingCalibrationFinishedPacket;

        this.handleSensorPacket(calibrationFinished);

        break;
      }

      case IncomingPongPacket.type: {
        const pong = packet as IncomingPongPacket;

        if (pong.id !== this.lastPingId + 1) {
          this.log('Ping ID does not match, ignoring');
        } else {
          this.log('Received pong');

          this.lastPingId = pong.id;
        }

        break;
      }

      case IncomingBatteryLevelPacket.type: {
        const batteryLevel = packet as IncomingBatteryLevelPacket;

        this.batteryVoltage = batteryLevel.voltage;
        this.batteryPercentage = batteryLevel.percentage;

        this.log(`Battery level changed to ${this.batteryVoltage}V (${this.batteryPercentage}%)`);

        break;
      }

      case IncomingTapPacket.type: {
        const tap = packet as IncomingTapPacket;

        this.handleSensorPacket(tap);

        break;
      }

      case IncomingErrorPacket.type: {
        const error = packet as IncomingErrorPacket;

        this.handleSensorPacket(error);

        break;
      }

      case IncomingSensorInfoPacket.type: {
        const sensorInfo = packet as IncomingSensorInfoPacket;

        this.log('Received sensor info');

        this.handleSensorPacket(sensorInfo);

        this.server.send(
          new OutgoingSensorInfoPacket(sensorInfo.sensorId, sensorInfo.sensorStatus).encode(),
          this._port,
          this._ip
        );

        break;
      }

      case IncomingRotationDataPacket.type: {
        const rotation = packet as IncomingRotationDataPacket;

        if (shouldDumpRotationDataPacketsRaw()) {
          this.log(rotation.toString());
        }

        this.rotation.update(rotation.rotation);

        if (shouldDumpRotationDataPacketsProcessed()) {
          this.log(`RotPac | ${this.rotation.toString()}`);
        }

        if (this.rotationDataPacketStream !== null) {
          const csv =
            [Date.now(), rotation.rotation[0], rotation.rotation[1], rotation.rotation[2], rotation.rotation[3]].join(
              ','
            ) + '\n';
          this.rotationDataPacketStream.write(csv);
        }

        break;
      }

      case IncomingMagnetometerAccuracyPacket.type: {
        const magnetometerAccuracy = packet as IncomingMagnetometerAccuracyPacket;

        this.handleSensorPacket(magnetometerAccuracy);

        break;
      }

      case IncomingSignalStrengthPacket.type: {
        const signalStrength = packet as IncomingSignalStrengthPacket;

        this.signalStrength = signalStrength.signalStrength;

        this.log(`Signal strength changed to ${this.signalStrength}`);

        break;
      }

      case IncomingTemperaturePacket.type: {
        const temperature = packet as IncomingTemperaturePacket;

        this.handleSensorPacket(temperature);

        break;
      }

      case IncomingRawIMUDataPacket.type: {
        const raw = packet as IncomingRawIMUDataPacket;

        if (shouldDumpRawIMUDataRaw()) {
          this.log(raw.toString());
        }

        this.rawRotation.update(raw.rotation);
        this.rawAcceleration.update(raw.acceleration);
        this.rawMagnetometer.update(raw.magnetometer);

        if (shouldDumpRawIMUDataProcessed()) {
          this.log(`Raw | ROT | ${this.rawRotation.toString()}`);
          this.log(`Raw | ACC | ${this.rawAcceleration.toString()}`);
          this.log(`Raw | MAG | ${this.rawMagnetometer.toString()}`);
        }

        if (this.rawIMUDataRawStream !== null) {
          const csv =
            [
              Date.now(),
              ...raw.rotation,
              raw.rotationAccuracy,
              ...raw.acceleration,
              raw.accelerationAccuracy,
              ...raw.magnetometer,
              raw.magnetometerAccuracy
            ].join(',') + '\n';
          this.rawIMUDataRawStream.write(csv);
        }

        break;
      }

      case IncomingFusedIMUDataPacket.type: {
        const fused = packet as IncomingFusedIMUDataPacket;

        if (shouldDumpFusedDataRaw()) {
          this.log(fused.toString());
        }

        this.fusedRotation.update(fused.quaternion);

        if (shouldDumpFusedDataProcessed()) {
          this.log(`Fused | ${this.fusedRotation.toString()}`);
        }

        if (this.fusedIMUDataRawStream !== null) {
          const csv = [Date.now(), ...fused.quaternion].join(',') + '\n';
          this.fusedIMUDataRawStream.write(csv);
        }

        break;
      }

      case IncomingCorrectionDataPacket.type: {
        const correction = packet as IncomingCorrectionDataPacket;

        if (shouldDumpCorrectionDataRaw()) {
          this.log(correction.toString());
        }

        this.correctedRotation.update(correction.quaternion);

        if (shouldDumpCorrectionDataProcessed()) {
          this.log(`Correction | ${this.correctedRotation.toString()}`);
        }

        if (this.correctionDataRawStream !== null) {
          const csv = [Date.now(), ...correction.quaternion].join(',') + '\n';
          this.correctionDataRawStream.write(csv);
        }

        break;
      }
    }
  }

  isNextPacket(packetNumber: bigint) {
    if (packetNumber >= BigInt(0)) {
      this._packetNumber = packetNumber;

      return true;
    }

    if (this._packetNumber < packetNumber) {
      return false;
    }

    this._packetNumber = packetNumber;

    return true;
  }

  ping() {
    this.server.send(new OutgoingPingPacket(this.lastPingId + 1).encode(), this._port, this._ip);

    this.log('Sent ping');
  }

  handleSensorPacket(packet: PacketWithSensorId) {
    const sensor = this.sensors[packet.sensorId];

    if (!sensor) {
      this.log(`Setting up sensor ${packet.sensorId}`);

      if (!(packet instanceof IncomingSensorInfoPacket)) {
        throw new Error(`Sensor ${packet.sensorId} is not an IncomingSensorInfoPacket`);
      }

      this.sensors[packet.sensorId] = new Sensor(this, packet.sensorType, packet.sensorId);

      this.log(`Added sensor ${packet.sensorId}`);

      return;
    }

    sensor.handle(packet);
  }

  getIP(): string {
    return this._ip;
  }

  getPort(): number {
    return this._port;
  }

  getMAC(): string {
    return this._mac;
  }

  getCurrentPacketNumber(): bigint {
    return this._packetNumber;
  }
}
