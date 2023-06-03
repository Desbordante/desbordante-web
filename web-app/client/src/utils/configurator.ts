export const getSelectValues: (opt: ReadonlyArray<any>) => number[] = (opt) => {
  return opt.map((element) => element.value);
};
export const getSelectOptions: (
  options: ReadonlyArray<any>,
  values: ReadonlyArray<number>
) => ReadonlyArray<any> = (options, values) => {
  return values !== undefined
    ? options.filter(({ value }) => values.includes(value))
    : [];
};
