/* eslint-disable */

import { colord } from "colord";

export default function (str: string, s: number, v: number): string {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  const h = Math.round((Math.sin(hash) + 1) * 180);

  return colord({ h, s, v }).toHex();
}
