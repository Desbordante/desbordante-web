import { Algorithms, FDoptions, optionsByAlgorithms } from '@constants/options';
import {
  Defaults,
  FormFieldsProps,
  CreateFormProcessor,
  CreateForm,
  Presets,
} from 'types/form';

const FDDefaults = {
  algorithmName: 'Pyro',
  errorThreshold: 1,
  maxLHS: 1,
  threadsCount: 1,
} satisfies Defaults;

const FDPresets: Presets<typeof FDDefaults> = [
  {
    filenames: 'EveryFile',
    presetName: 'Strict preset',
    preset: {
      errorThreshold: 0,
    },
  },
  {
    filenames: ['breast_cancer.csv'],
    presetName: 'Breast Cancer Example preset',
    preset: {
      errorThreshold: 0.03,
    },
  },
];

const FDFields = {
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
} satisfies FormFieldsProps<typeof FDDefaults>;

const FDProcessor = CreateFormProcessor<typeof FDDefaults, typeof FDFields>(
  (form, setForm, methods) => {
    const algo = methods.getValues('algorithmName') as Algorithms;

    setForm((formSnapshot) => {
      formSnapshot.errorThreshold.disabled =
        !optionsByAlgorithms[algo].includes('threshold');
      formSnapshot.maxLHS.disabled =
        !optionsByAlgorithms[algo].includes('arity');
      formSnapshot.threadsCount.disabled =
        !optionsByAlgorithms[algo].includes('threads');
      return { ...formSnapshot };
    });
  },
  [['algorithmName']],
);

export const FDForm = CreateForm({
  formDefaults: FDDefaults,
  formFields: FDFields,
  formProcessor: FDProcessor,
  formPresets: FDPresets,
});
