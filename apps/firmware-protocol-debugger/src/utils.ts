import { networkInterfaces } from 'os';

export const getBroadcastAddresses = (): [string[], string[]] => {
  const broadcasts: string[] = [];
  const blacklist: string[] = [];

  const ifaces = networkInterfaces();
  for (const i of Object.keys(ifaces)) {
    const iface = ifaces[i];

    if (iface === undefined) {
      continue;
    }

    for (const ip of iface) {
      if (ip.family !== 'IPv4' || ip.internal) {
        continue;
      }

      const split = ip.address.split('.');

      split[3] = '255';

      broadcasts.push(split.join('.'));
      blacklist.push(ip.address);
    }
  }

  return [broadcasts, blacklist];
};

export const shouldDumpAllPacketsRaw = () => {
  return process.argv.includes('--dump-all-packets-raw');
};

export const shouldDumpRotationDataPacketsRaw = () => {
  return process.argv.includes('--dump-rotation-data-packets-raw');
};

export const shouldDumpRotationDataPacketsProcessed = () => {
  return process.argv.includes('--dump-rotation-data-packets-processed');
};

export const rotationDataPacketDumpFile = () => {
  const index = process.argv.indexOf('--rotation-data-packets-file');
  if (index === -1) {
    return '';
  }

  return process.argv[index + 1];
};

export const shouldDumpFusedDataRaw = () => {
  return process.argv.includes('--dump-fused-imu-data-raw');
};

export const shouldDumpFusedDataProcessed = () => {
  return process.argv.includes('--dump-fused-imu-data-processed');
};

export const fusedIMUDataDumpFile = () => {
  const index = process.argv.indexOf('--fused-imu-data-file');
  if (index === -1) {
    return '';
  }

  return process.argv[index + 1];
};

export const shouldDumpRawIMUDataRaw = () => {
  return process.argv.includes('--dump-raw-imu-data-raw');
};

export const shouldDumpRawIMUDataProcessed = () => {
  return process.argv.includes('--dump-raw-imu-data-processed');
};

export const rawIMUDataDumpFile = () => {
  const index = process.argv.indexOf('--raw-imu-data-file');
  if (index === -1) {
    return '';
  }

  return process.argv[index + 1];
};

export const shouldDumpCorrectionDataRaw = () => {
  return process.argv.includes('--dump-correction-data-raw');
};

export const shouldDumpCorrectionDataProcessed = () => {
  return process.argv.includes('--dump-correction-data-processed');
};

export const correctionDataDumpFile = () => {
  const index = process.argv.indexOf('--correction-data-file');
  if (index === -1) {
    return '';
  }

  return process.argv[index + 1];
};
