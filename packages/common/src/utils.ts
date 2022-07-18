export type Vector = [number, number, number];
export type Quaternion = [number, number, number, number];

export const formatMACAddressDigit = (mac: number) => {
  return mac.toString(16).padStart(2, '0').toUpperCase();
};
