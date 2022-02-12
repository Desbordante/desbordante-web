/* eslint-disable no-bitwise */
import { colord } from "colord";
// @ts-ignore
import stringHash from "string-hash";

export default function (str: string, s: number, v: number): string {
  const maxValue = 4294967295;
  const h = (stringHash(str) / maxValue) * 360;
  return colord({ h, s, v }).toHex();
}
