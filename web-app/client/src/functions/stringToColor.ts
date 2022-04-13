import { colord } from "colord";
// @ts-ignore
import stringHash from "string-hash";

export default function (str: string, s: number, v: number, hueShift: number = 0): string {
  const maxValue = 4294967295;
  const h = (stringHash(str) / maxValue) * 360 + hueShift;
  return colord({ h, s, v }).toHex();
}
