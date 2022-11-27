export enum InputType {
  SELECT = 'select',
  CHECKBOX = 'checkbox',
}

type InputBase<T> = {
  label: string;
  name: T;
};

type Option = {
  label: string;
  value: string;
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
