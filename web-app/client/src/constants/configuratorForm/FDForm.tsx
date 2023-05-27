import { Algorithms, FDoptions, optionsByAlgorithms } from '@constants/options';
import {
  Defaults,
  FormFieldsProps,
  CreateFormProcessor,
  CreateForm,
} from 'types/form';

const fd_defaults = {
  algorithmName: 'Pyro',
  errorThreshold: 1,
  maxLHS: 1,
  threadsCount: 1,
} satisfies Defaults;

const fd_fields = {
  algorithmName: {
    order: 0,
    type: 'select',
    label: 'Algorithm',
    isLoading: false,
    options: FDoptions,
  },
  errorThreshold: {
    order: 1,
    type: 'number_slider',
    label: 'Error threshold',
    numberSliderProps: { min: 0, max: 1, step: 1e-4, size: 4 },
    disabled: false as boolean,
  },
  maxLHS: {
    order: 2,
    type: 'number_slider',
    label: 'Arity constraint',
    numberSliderProps: { min: 1, max: 10, step: 1, size: 4 },
    disabled: false as boolean,
  },
  threadsCount: {
    order: 3,
    type: 'number_slider',
    label: 'Thread count',
    numberSliderProps: { min: 1, max: 8, step: 1, size: 4 },
    disabled: false as boolean,
  },
} satisfies FormFieldsProps<typeof fd_defaults>;

const fd_processor = CreateFormProcessor<typeof fd_defaults, typeof fd_fields>(
  (form, methods) => {
    const algo = methods.getValues('algorithmName') as Algorithms;

    form.errorThreshold.disabled =
      !optionsByAlgorithms[algo].includes('threshold');
    form.maxLHS.disabled = !optionsByAlgorithms[algo].includes('arity');
    form.threadsCount.disabled = !optionsByAlgorithms[algo].includes('threads');

    // return form;
    return { ...form };
  },
  [['algorithmName']]
);

export const fd_form = CreateForm(
  fd_defaults,
  fd_fields,
  undefined,
  fd_processor
);
