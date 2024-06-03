import { ComponentProps } from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

export type ControlRules<T extends FieldValues> = ComponentProps<
  typeof Controller<T>
>['rules'];

export type ControlProps<T extends FieldValues> = {
  controlName: Path<T>;
  control: Control<T>;
  rules?: ControlRules<T>;
};
