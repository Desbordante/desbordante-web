export const formatToRange = <T, TResult>(
  values: [T | undefined, T | undefined],
  formatter: (value: T) => TResult,
) =>
  values.some(Boolean)
    ? {
        from: values[0] ? formatter(values[0]) : undefined,
        to: values[1] ? formatter(values[1]) : undefined,
      }
    : undefined;
