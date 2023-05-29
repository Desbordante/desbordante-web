import { CFDoptions } from '@constants/options';
import { Defaults, FormFieldsProps, CreateForm } from 'types/form';

const cfd_defaults = {
  algorithmName: 'CTane',
  minConfidence: 0,
  maxLHS: 1,
  minSupportCFD: 1,
} satisfies Defaults;

const cfd_fields = {
  algorithmName: {
    order: 0,
    type: 'select',
    label: 'Algorithm',
    isLoading: false,
    options: CFDoptions,
  },
  minConfidence: {
    order: 1,
    type: 'number_slider',
    label: 'Minimum confidence',
    numberSliderProps: { min: 0, max: 1, step: 1e-4, size: 4 },
  },
  maxLHS: {
    order: 2,
    type: 'number_slider',
    label: 'Arity constraint',
    numberSliderProps: { min: 1, max: 10, step: 1, size: 4 },
  },
  minSupportCFD: {
    order: 3,
    type: 'number_slider',
    label: 'Minimum support',
    numberSliderProps: { min: 1, max: 16, step: 1, size: 4 },
  },
} satisfies FormFieldsProps<typeof cfd_defaults>;

export const cfd_form = CreateForm(cfd_defaults, cfd_fields);
