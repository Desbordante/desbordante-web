import { ARoptions } from '@constants/options';
import { Defaults, FormFieldsProps, CreateForm } from 'types/form';

const ar_defaults = {
  algorithmName: 'Apriori',
  minConfidence: 0,
  minSupportAR: 0,
} satisfies Defaults;

const ar_fields = {
  algorithmName: {
    order: 0,
    type: 'select',
    label: 'Algorithm',
    isLoading: false,
    options: ARoptions,
  },
  minConfidence: {
    order: 1,
    type: 'number_slider',
    label: 'Minimum confidence',
    numberSliderProps: { min: 0, max: 1, step: 1e-4, size: 5 },
  },
  minSupportAR: {
    order: 1,
    type: 'number_slider',
    label: 'Minimum support',
    numberSliderProps: { min: 0, max: 1, step: 1e-4, size: 5 },
  },
} satisfies FormFieldsProps<typeof ar_defaults>;

export const ar_form = CreateForm(ar_defaults, ar_fields, undefined, undefined);
