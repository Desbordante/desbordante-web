import { ApproxOptions, TypoOptions } from '@constants/options';
import {
  Defaults,
  FormFieldsProps,
  CreateForm,
  ArrayToOptions,
} from 'types/form';

const typofd_defaults = {
  preciseAlgorithm: 'FastFDs',
  approximateAlgorithm: 'Pyro',
  maxLHS: 5,
  errorThreshold: 0.1,
  threadsCount: 2,
  defaultRadius: 3,
  defaultRatio: 1,
  algorithmName: 'Typo Miner', // constant
  metric: 'MODULUS_OF_DIFFERENCE', // constant
} satisfies Defaults;

const typofd_fields = {
  preciseAlgorithm: {
    order: 0,
    type: 'select',
    label: 'Precise Algorithm',
    isLoading: false,
    options: TypoOptions,
  },
  approximateAlgorithm: {
    order: 1,
    type: 'select',
    label: 'Approximate Algorithm',
    isLoading: false,
    options: ApproxOptions,
  },
  errorThreshold: {
    order: 2,
    type: 'number_slider',
    label: 'Error threshold',
    numberSliderProps: { min: 0, max: 1, step: 1e-4, size: 4 },
  },
  maxLHS: {
    order: 3,
    type: 'number_slider',
    label: 'Arity constraint',
    numberSliderProps: { min: 1, max: 9, step: 1, size: 4 },
  },
  threadsCount: {
    order: 4,
    type: 'number_slider',
    label: 'Thread count',
    numberSliderProps: { min: 1, max: 8, step: 1, size: 4 },
  },
  defaultRadius: {
    order: 5,
    type: 'number_slider',
    label: 'Radius',
    numberSliderProps: { min: 1, max: 10, step: 1e-4, size: 4 },
  },
  defaultRatio: {
    order: 6,
    type: 'number_slider',
    label: 'Ratio',
    numberSliderProps: { min: 0, max: 1, step: 1e-2, size: 4 },
  },
  algorithmName: {
    order: 7,
    type: 'select',
    label: 'algorithmName',
    isLoading: false,
    options: ArrayToOptions(['Typo Miner']),
    isConstant: true,
  },
  metric: {
    order: 8,
    type: 'select',
    label: 'metric',
    isLoading: false,
    options: ArrayToOptions(['MODULUS_OF_DIFFERENCE']),
    isConstant: true,
  },
} satisfies FormFieldsProps<typeof typofd_defaults>;

export const typofd_form = CreateForm(typofd_defaults, typofd_fields);
