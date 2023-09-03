import { CFDOptions, CFDSubstrategiesOptions } from '@constants/options';
import { Defaults, FormFieldsProps, CreateForm, Presets } from 'types/form';
import { CFDSubstrategyType } from 'types/globalTypes';

const CFDDefaults = {
  algorithmName: 'FDFirstDFS',
  minConfidence: 0,
  maxLHS: 1,
  minSupportCFD: 1,
  substrategy: CFDSubstrategyType.DFS,
} satisfies Defaults;

const CFDPresets: Presets<typeof CFDDefaults> = [
  {
    filenames: 'EveryFile',
    presetName: 'Example preset',
    preset: {
      minConfidence: 1,
    },
  },
  {
    filenames: ['Workshop.csv'],
    presetName: 'Workshop Example preset',
    preset: {
      minSupportCFD: 100,
    },
  },
];

const CFDFields = {
  algorithmName: {
    order: 0,
    type: 'select',
    label: 'Algorithm',
    isLoading: false,
    options: CFDOptions,
  },
  minConfidence: {
    order: 1,
    type: 'number_slider',
    label: 'Minimum confidence',
    numberSliderProps: { min: 0, max: 1, step: 1e-4, size: 4 },
  },
  substrategy: {
    order: 2,
    type: 'select',
    label: 'Lattice traversal strategy',
    isLoading: false,
    options: CFDSubstrategiesOptions,
  },
  maxLHS: {
    order: 3,
    type: 'number_slider',
    label: 'Arity constraint',
    numberSliderProps: { min: 1, max: 10, step: 1, size: 4 },
  },
  minSupportCFD: {
    order: 4,
    type: 'number_slider',
    label: 'Minimum support',
    numberSliderProps: { min: 1, max: 16, step: 1, size: 4 },
  },
} satisfies FormFieldsProps<typeof CFDDefaults>;

export const CFDForm = CreateForm({
  formDefaults: CFDDefaults,
  formFields: CFDFields,
});
