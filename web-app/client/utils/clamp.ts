const clamp = (number: number, min: number, max?: number) => {
  const computedMax = Math.max(min, number);
  if (max !== undefined) {
    return Math.min(max, computedMax);
  }

  return computedMax;
};

export default clamp;
