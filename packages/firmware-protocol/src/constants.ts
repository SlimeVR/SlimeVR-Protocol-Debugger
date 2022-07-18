export enum Protocol {
  UNKNOWN = 0,
  OWO_LEGACY = 1,
  SLIMEVR_RAW = 2
}

export enum SensorStatus {
  UNKNOWN = 0,
  OK = 1,
  ERROR = 2
}

export enum RawCalibrationDataType {
  INTERNAL_GYRO = 1,
  INTERNAL_ACCEL = 2,
  INTERNAL_MAG = 3,

  EXTERNAL_ALL = 4,
  EXTERNAL_GYRO = 5,
  EXTERNAL_ACCEL = 6,
  EXTERNAL_MAG = 7
}

export enum SensorType {
  UNKNOWN = -1,
  MPU9250 = 1,
  MPU6500 = 2,
  BNO080 = 3,
  BNO085 = 4,
  BNO055 = 5,
  MPU6050 = 6,
  BNO086 = 7,
  BMI160 = 8,
  ICM20948 = 9
}
