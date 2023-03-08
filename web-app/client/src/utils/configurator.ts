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

export function omit(obj: any, ...props: any) {
  const result = { ...obj };
  props.forEach(function (prop: any) {
    delete result[prop];
  });
  return result;
}
