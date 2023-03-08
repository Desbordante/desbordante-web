import { FC } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { UseControllerProps } from 'react-hook-form/dist/types/controller';
import { Path } from 'react-hook-form/dist/types/path/eager';
export type FormValueType = string | string[] | number | number[] | boolean;

export type Defaults = Record<string, FormValueType>;

export type FormField<
  TDefaultValues extends Defaults,
  TName extends Path<TDefaultValues>
> = {
  order: number;
  type: string;
  label: string;
  tooltip?: string;
  error?: string;
  rules?: UseControllerProps<TDefaultValues, TName>['rules'];
};

// Field with custom inner component
export type FormCustom<
  TDefaultValues extends Defaults,
  TName extends Path<TDefaultValues>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TAdditionalProps = Record<string, any>
> = FormField<TDefaultValues, TName> &
  TAdditionalProps & {
    type: 'custom';

    component: FC<FormField<TDefaultValues, TName> & TAdditionalProps>;
  };

// Field with select
export type FormSelect<
  TDefaultValues extends Defaults,
  TName extends Path<TDefaultValues>
> = FormField<TDefaultValues, TName> & {
  type: 'select';

  options: string[];
  isLoading?: boolean;
};

// Field with multiple select
export type FormMultiSelect<
  TDefaultValues extends Defaults,
  TName extends Path<TDefaultValues>
> = FormField<TDefaultValues, TName> & {
  type: 'multi_select';

  options: string[];
  isLoading?: boolean;
};

// Field with number slider
export type FormNumberSlider<
  TDefaultValues extends Defaults,
  TName extends Path<TDefaultValues>
> = FormField<TDefaultValues, TName> & {
  type: 'number_slider';

  min: number;
  max: number;
  step: number;
};

// Field with number input
export type FormNumberInput<
  TDefaultValues extends Defaults,
  TName extends Path<TDefaultValues>
> = FormField<TDefaultValues, TName> & {
  type: 'number_input';

  min?: number;
  includingMin?: boolean;
  max?: number;
  includingMax?: boolean;
  numbersAfterDot?: number;
};

// Field with checkbox
export type FormCheckbox<
  TDefaultValues extends Defaults,
  TName extends Path<TDefaultValues>
> = FormField<TDefaultValues, TName> & {
  type: 'checkbox';

  variant?: 'outline' | 'simple'; // change for union type ???
};

// Field with radio
export type FormRadio<
  TDefaultValues extends Defaults,
  TName extends Path<TDefaultValues>
> = FormField<TDefaultValues, TName> & {
  type: 'radio';
};

// Field with text
export type FormText<
  TDefaultValues extends Defaults,
  TName extends Path<TDefaultValues>
> = FormField<TDefaultValues, TName> & {
  type: 'text';
};

export type FormInput<
  TDefaultValues extends Defaults,
  TName extends Path<TDefaultValues>
> =
  //Add new fields here \/ \/ \/
  | FormSelect<TDefaultValues, TName>
  | FormMultiSelect<TDefaultValues, TName>
  | FormNumberSlider<TDefaultValues, TName>
  | FormNumberInput<TDefaultValues, TName>
  | FormCheckbox<TDefaultValues, TName>
  | FormRadio<TDefaultValues, TName>
  | FormText<TDefaultValues, TName>
  | FormCustom<TDefaultValues, TName>;

export type FormFields<TFields extends Defaults> = {
  // @ts-expect-error Key is string and string can be used as Path
  [Key in keyof TFields]: FormInput<TFields, Key>; // TODO: add extraction for correct form input
};

export type FormHook<
  TFields extends Defaults,
  TFormFields extends FormFields<TFields>
> = (
  fileID: string,
  form: TFormFields,
  methods: UseFormReturn<TFields>
) => void;

export type FormLogic<
  TFields extends Defaults,
  TFormFields extends FormFields<TFields>
> = (form: TFormFields, methods: UseFormReturn<TFields>) => TFormFields;

export type FormProcessor<
  TFields extends Defaults,
  TFormFields extends FormFields<TFields>
> = {
  formLogic: FormLogic<TFields, TFormFields>;
  deps: (keyof TFields)[];
};

export const CreateFormProcessor: <
  TFields extends Defaults,
  TFormFields extends FormFields<TFields>
>(
  formLogic: FormLogic<TFields, TFormFields>,
  deps: (keyof TFields)[]
) => FormProcessor<TFields, TFormFields> = (formLogic, deps) => {
  return {
    formLogic,
    deps,
  };
};

export type Form<
  TFields extends Defaults,
  TFormFields extends FormFields<TFields>
> = {
  formDefaults: TFields;
  formFields: TFormFields;
  useFormHook: FormHook<TFields, TFormFields>;
  formProcessor: FormProcessor<TFields, TFormFields>;
};

export const CreateForm: <
  TFields extends Defaults,
  TFormFields extends FormFields<TFields>
>(
  formDefaults: TFields,
  formFields: TFormFields,
  useFormHook?: FormHook<TFields, TFormFields>,
  formProcessor?: FormProcessor<TFields, TFormFields>
) => Form<TFields, TFormFields> = (
  formDefaults,
  formFields,
  useFormHook = undefined,
  formProcessor = undefined
) => {
  return {
    formDefaults,
    formFields,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    useFormHook: useFormHook || (() => {}),
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    formProcessor: formProcessor || {
      formLogic: (form) => {
        return form;
      },
      deps: [],
    },
  };
};
