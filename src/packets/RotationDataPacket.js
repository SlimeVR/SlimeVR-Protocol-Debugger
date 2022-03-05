const Packet = require('./Packet');

module.exports = class RotationDataPacket extends Packet {
  /**
   * @param {Buffer} data
   */
  constructor(data) {
    super(RotationDataPacket.type);

    this.sensorId = data.readUintBE(0, 1) & 0xff;
    this.dataType = data.readUintBE(1, 1) & 0xff;

    this.rotation = [data.readFloatBE(2), data.readFloatBE(6), data.readFloatBE(10), data.readFloatBE(14)];
  }

  static get type() {
    return 17;
  }

  toString() {
    return `RotationDataPacket{sensorId: ${this.sensorId}, dataType: ${this.dataType}, rotation: ${this.rotation}}`;
  }
};