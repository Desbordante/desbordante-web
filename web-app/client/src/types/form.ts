import React, { FC, ReactElement } from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  ControllerRenderProps,
  UseControllerProps,
} from 'react-hook-form/dist/types/controller';
import { Path } from 'react-hook-form/dist/types/path/eager';
import { OptionWithBadges } from 'types/multiSelect';
export type FormValueType = string | string[] | number | number[] | boolean;

export type Defaults = Record<string, FormValueType>;

export type Presets<TDefaultValues extends Defaults> = {
  filenames: 'EveryFile' | string[];
  presetName: string;
  preset: Partial<TDefaultValues>;
}[];

export type FormFieldProps<
  TDefaultValues extends Defaults,
  TName extends Path<TDefaultValues>,
> = {
  order: number;
  type: string;
  label: string;
  tooltip?: string;
  error?: string | undefined;
  disabled?: boolean;
  clientOnly?: boolean;
  isDisplayable?: boolean;
  rules?: UseControllerProps<TDefaultValues, TName>['rules'];
};

export type FormHiddenValueProps<
  TDefaultValues extends Defaults,
  TName extends Path<TDefaultValues>,
> = FormFieldProps<TDefaultValues, TName> & {
  type: 'hidden_value';
  label: '';
  isDisplayable: false;
};

// Field with custom inner component
export type FormCustomProps<
  TDefaultValues extends Defaults,
  TName extends Path<TDefaultValues>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TAdditionalProps = Record<string, any>,
> = FormFieldProps<TDefaultValues, TName> &
  TAdditionalProps & {
    type: 'custom';

    component: FC<FormFieldProps<TDefaultValues, TName> & TAdditionalProps>;
  };

export type FormSelectOptions = OptionWithBadges[];

export const ArrayToOptions: (
  options: (string | number)[],
  prefix?: string,
) => OptionWithBadges[] = (options, prefix) => {
  return options.map((option) => ({
    label: (prefix ? `${prefix} ` : '') + String(option),
    value: option,
  }));
};

// Field with select
export type FormSelectProps<
  TDefaultValues extends Defaults = Defaults,
  TName extends Path<TDefaultValues> = Path<TDefaultValues>,
> = FormFieldProps<TDefaultValues, TName> & {
  type: 'select';

  options: FormSelectOptions;
  isLoading: boolean;
};

// Field with multiple select
export type FormMultiSelectProps<
  TDefaultValues extends Defaults = Defaults,
  TName extends Path<TDefaultValues> = Path<TDefaultValues>,
> = FormFieldProps<TDefaultValues, TName> & {
  type: 'multi_select';

  options: FormSelectOptions;
  isLoading: boolean;
};

// Field with number slider
export type FormNumberSliderProps<
  TDefaultValues extends Defaults = Defaults,
  TName extends Path<TDefaultValues> = Path<TDefaultValues>,
> = FormFieldProps<TDefaultValues, TName> & {
  type: 'number_slider';

  numberSliderProps: {
    min: number;
    max: number;
    step: number;

    size?: number;
  };
};

// Field with number input
export type FormNumberInputProps<
  TDefaultValues extends Defaults = Defaults,
  TName extends Path<TDefaultValues> = Path<TDefaultValues>,
> = FormFieldProps<TDefaultValues, TName> & {
  type: 'number_input';

  numberInputProps: {
    defaultNum: number;
    min?: number;
    includingMin?: boolean;
    max?: number;
    includingMax?: boolean;
    numbersAfterDot?: number;
  };
};

// Field with checkbox
export type FormCheckboxProps<
  TDefaultValues extends Defaults = Defaults,
  TName extends Path<TDefaultValues> = Path<TDefaultValues>,
> = FormFieldProps<TDefaultValues, TName> & {
  type: 'checkbox';

  variant?: 'outline' | 'simple';
};

// Field with radio
export type FormRadioProps<
  TDefaultValues extends Defaults = Defaults,
  TName extends Path<TDefaultValues> = Path<TDefaultValues>,
> = FormFieldProps<TDefaultValues, TName> & {
  type: 'radio';

  innerName: string;
};

// Field with text
export type FormTextProps<
  TDefaultValues extends Defaults = Defaults,
  TName extends Path<TDefaultValues> = Path<TDefaultValues>,
> = FormFieldProps<TDefaultValues, TName> & {
  type: 'text';
};

export type FormInputProps<
  TDefaultValues extends Defaults = Defaults,
  TName extends Path<TDefaultValues> = Path<TDefaultValues>,
> =
  //Add new fields here \/ \/ \/
  | FormHiddenValueProps<TDefaultValues, TName>
  | FormSelectProps<TDefaultValues, TName>
  | FormMultiSelectProps<TDefaultValues, TName>
  | FormNumberSliderProps<TDefaultValues, TName>
  | FormNumberInputProps<TDefaultValues, TName>
  | FormCheckboxProps<TDefaultValues, TName>
  | FormRadioProps<TDefaultValues, TName>
  | FormTextProps<TDefaultValues, TName>
  | FormCustomProps<TDefaultValues, TName>;

type TypeToFormFieldType<T> = T extends string
  ? 'text' | 'select' | 'custom' | 'hidden_value'
  : T extends number
    ? 'number_input' | 'number_slider' | 'custom' | 'hidden_value'
    : T extends boolean
      ? 'select' | 'checkbox' | 'radio' | 'custom' | 'hidden_value'
      : T extends string[]
        ? 'multi_select' | 'custom' | 'hidden_value'
        : T extends number[]
          ? 'multi_select' | 'custom' | 'hidden_value'
          : never;

export type FormFieldsProps<TFields extends Defaults> = {
  [Key in keyof TFields]: Extract<
    FormInputProps,
    { type: TypeToFormFieldType<TFields[Key]> }
  >;
};

export type FormHook<
  TFields extends Defaults,
  TFormFields extends FormFieldsProps<TFields>,
> = (
  fileID: string,
  form: TFormFields,
  setForm: React.Dispatch<React.SetStateAction<TFormFields>>,
  methods: UseFormReturn<TFields>,
) => void;

export type FormLogic<
  TFields extends Defaults,
  TFormFields extends FormFieldsProps<TFields>,
> = (
  form: TFormFields,
  setForm: React.Dispatch<React.SetStateAction<TFormFields>>,
  methods: UseFormReturn<TFields>,
  depsIndexRef: React.MutableRefObject<number>,
) => void;

export type FormProcessor<
  TFields extends Defaults,
  TFormFields extends FormFieldsProps<TFields>,
> = {
  formLogic: FormLogic<TFields, TFormFields>;
  deps: (keyof TFields)[][];
};

export const CreateFormProcessor: <
  TFields extends Defaults,
  TFormFields extends FormFieldsProps<TFields>,
>(
  formLogic: FormLogic<TFields, TFormFields>,
  deps: (keyof TFields)[][],
) => FormProcessor<TFields, TFormFields> = (formLogic, deps) => {
  return {
    formLogic,
    deps,
  };
};

export type Form<
  TFields extends Defaults = Defaults,
  TFormFields extends FormFieldsProps<TFields> = FormFieldsProps<TFields>,
> = {
  formDefaults: TFields;
  formFields: TFormFields;
  formPresets: Presets<TFields>;
  useFormHook: FormHook<TFields, TFormFields>;
  formProcessor: FormProcessor<TFields, TFormFields>;
};

export const CreateForm: <
  TFields extends Defaults,
  TFormFields extends FormFieldsProps<TFields>,
>(props: {
  formDefaults: TFields;
  formFields: TFormFields;
  formPresets?: Presets<TFields>;
  useFormHook?: FormHook<TFields, TFormFields>;
  formProcessor?: FormProcessor<TFields, TFormFields>;
}) => Form<TFields, TFormFields> = ({
  formDefaults,
  formFields,
  formPresets = undefined,
  useFormHook = undefined,
  formProcessor = undefined,
}) => {
  return {
    formDefaults,
    formFields,
    formPresets: formPresets || [],
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

export type FieldControllerRenderProps<TFieldValues extends Defaults> =
  ControllerRenderProps<TFieldValues>;
export type FormInputElementProps<TFieldValues extends Defaults> = {
  field: FieldControllerRenderProps<TFieldValues>;
  props: FormInputProps;
};
export type FormInputElement<TFieldValues extends Defaults> = (
  props: FormInputElementProps<TFieldValues>,
) => ReactElement;
