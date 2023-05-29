import { ARoptions } from '@constants/options';
import { Defaults, FormFieldsProps, CreateForm } from 'types/form';

const ARDefaults = {
  algorithmName: 'Apriori',
  minConfidence: 0,
  minSupportAR: 0,
} satisfies Defaults;

const ARFields = {
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
    order: 2,
    type: 'number_slider',
    label: 'Minimum support',
    numberSliderProps: { min: 0, max: 1, step: 1e-4, size: 5 },
  },
} satisfies FormFieldsProps<typeof ARDefaults>;

export const ARForm = CreateForm({
  formDefaults: ARDefaults,
  formFields: ARFields,
});
