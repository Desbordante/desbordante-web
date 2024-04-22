export enum InputType {
  SELECT = 'select',
  CHECKBOX = 'checkbox',
}

type InputBase<T> = {
  label: string;
  name: T;
};

export type Option<TValue = string> = {
  label: string;
  value: TValue;
};

type SelectProps = {
  type: InputType.SELECT;
  options: Option[];
  value: string;
};

type CheckboxProps = {
  type: InputType.CHECKBOX;
};

export type InputProps<T> = InputBase<T> & (SelectProps | CheckboxProps);
