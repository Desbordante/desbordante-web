/* eslint-disable */

import hslToHex from "hsl-to-hex";

export default function(
  str: string,
  saturation: number,
  lightness: number
): string {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  const hue = Math.round((Math.sin(hash) + 1) * 180);

  return hslToHex(hue, saturation, lightness);
}
