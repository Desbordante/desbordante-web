import { FC } from 'react';
import { UseFormReturn, ControllerProps } from 'react-hook-form';
import { Path } from 'react-hook-form/dist/types/path/eager';

type FormValueType = string | string[] | number | number[] | boolean;

// field
type FormField<FieldNames extends string> = {
  order: number;
  type: string;
  label: string;
  description?: string;
  error?: string;
  defaultValue: FormValueType;
  rules?: ControllerProps<
    Record<FieldNames, unknown>, // any
    Path<Record<FieldNames, unknown>> // any
  >['rules'];
};

export type FormCustom<
  FieldNames extends string,
  AdditionalProps extends object
> = FormField<FieldNames> &
  AdditionalProps & {
    component: FC<FormField<FieldNames> & AdditionalProps>;
  };

export type FormSelect<FieldNames extends string> = FormField<FieldNames> & {
  type: 'select';

  options: string[];
};

export type FormMultiSelect<FieldNames extends string> =
  FormField<FieldNames> & {
    type: 'multi-select';

    options: string[];
  };

export type FormNumberSlider<FieldNames extends string> =
  FormField<FieldNames> & {
    type: 'number-slider';

    min: number;
    max: number;
    step: number;
  };

export type FormNumberInput<FieldNames extends string> =
  FormField<FieldNames> & {
    type: 'number-input';

    min?: number;
    includingMin?: boolean;
    max?: number;
    includingMax?: boolean;
    numbersAfterDot?: number;
  };

export type FormInput<
  FieldNames extends string,
  AdditionalProps extends object = Record<string, unknown>
> =
  | FormCustom<FieldNames, AdditionalProps>
  | FormSelect<FieldNames>
  | FormMultiSelect<FieldNames>
  | FormNumberSlider<FieldNames>
  | FormNumberInput<FieldNames>;

export type Form<FieldNames extends string> = Record<
  FieldNames,
  FormInput<FieldNames>
>;

export type DefaultValues<T extends Form<string>> = {
  [Key in keyof T]: T[Key]['defaultValue'];
};

export const getFormDefaults = <T extends Form<string>>(form: T) =>
  Object.entries(form).reduce(
    (acc, [name, field]) => ({ ...acc, [name]: field.defaultValue }),
    {} as DefaultValues<typeof form>
  );

export type Interceptor<T extends Form<string>> = (
  form: T,
  methods: UseFormReturn<DefaultValues<T>>
) => T;

// TODO: add callback type for modifying fields before sending to the server
