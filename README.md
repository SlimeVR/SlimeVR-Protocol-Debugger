# SlimeVR Tracker Inspector

> Simple SlimeVR inspection utility written in JavaScript without any dependencies

## Getting Started

Make sure you stopped the SlimeVR server before running this utility.

```shell
git clone https://github.com/TheDevMinerTV/SlimeVR-Tracker-ESP
cd SlimeVR-Tracker-ESP
git checkout feat/raw-data-inspection

# Edit src/debug.h
# Set `ENABLE_INSPECTION` to `true`
# Set `POWERSAVING_MODE` to `POWER_SAVING_NONE`

# Flash your ESP

cd ..

git clone https://github.com/TheDevMinerTV/SlimeVR-Tracker-Inspector
cd SlimeVR-Tracker-Inspector
node . # add flags from below to enable features
```

## Flags

- `--dump-rotation-data-packets-raw`: Dump all RotationData packets to the console.
- `--dump-rotation-data-packets-processed`: Process the RotationData packets with averaging and standard distribution and dump them to the console.
- `--dump-fused-imu-data-raw`: Dump all FusedIMUData packets to the console.
- `--dump-fused-imu-data-processed`: Process the FusedIMUData packets with averaging and standard distribution and dump them to the console.
- `--dump-raw-imu-data-raw`: Dump all RawIMUData packets to the console.
- `--dump-raw-imu-data-processed`: Process the RawIMUData packets with averaging and standard distribution and dump them to the console.