import { ACoptions } from '@constants/options';
import { UpperCaseOption } from '@utils/uppercaseOptions';
import { toScreamingSnakeOption } from '@constants/options';
import { Defaults, FormFieldsProps, CreateForm, Presets } from 'types/form';
import SeedCustomInput from './SeedCustomInput';

const ACoperations = [
  'Addition',
  'Subtraction',
  'Multiplication',
  'Division',
] as const;

type ACoperation = (typeof ACoperations)[number];

type ACoperationOption = UpperCaseOption<ACoperation>;

const ACoperationOptions: ACoperationOption[] = ACoperations.map(
  toScreamingSnakeOption,
);

export const ACDefaults = {
  algorithmName: 'BHUNT',
  weight: 1,
  fuzziness: 0,
  pFuzz: 1,
  bumpsLimit: 10,
  iterationsLimit: 3,
  seed: 1,
  operation: 'MULTIPLICATION',
} satisfies Defaults;

const ACPresets: Presets<typeof ACDefaults> = [
  {
    filenames: 'EveryFile',
    presetName: 'Some preset',
    preset: {
      seed: 10,
      operation: 'ADDITION',
    },
  },
];

const ACFields = {
  algorithmName: {
    order: 0,
    type: 'select',
    label: 'Algorithm',
    isLoading: false,
    options: ACoptions,
  },
  operation: {
    order: 1,
    type: 'select',
    label: 'Operation',
    isLoading: false,
    options: ACoperationOptions,
  },
  bumpsLimit: {
    order: 2,
    type: 'number_input',
    label: 'Bumps Limit',
    tooltip:
      'There is no direct analogue in the paper, 0 allows an arbitrary bumps number.',
    numberInputProps: {
      defaultNum: 3.0,
      min: 0,
      includingMin: true,
      numbersAfterDot: 0,
    },
  },
  weight: {
    order: 3,
    type: 'number_slider',
    label: 'Weight',
    tooltip:
      'Weight defines the size of discovered intervals, 0 — lots of small intervals, 1 — a single large one. This parameter is called w in the paper.',
    numberSliderProps: { min: 0, max: 1, step: 1e-4, size: 4 },
  },
  iterationsLimit: {
    order: 4,
    type: 'number_input',
    label: 'Iterations Limit',
    tooltip:
      'Iterations limit is the maximum number of algorithm iterations. This parameter is called i_max in the paper.',
    numberInputProps: {
      defaultNum: 3.0,
      min: 1,
      includingMin: true,
      numbersAfterDot: 0,
    },
  },
  fuzziness: {
    order: 5,
    type: 'number_slider',
    label: 'Fuzziness',
    tooltip:
      'Fuzziness is the fraction of rows not included in the sample: the closer to 0, the more rows will be selected and the closer to 1, the fewer rows will be selected. This parameter is called f in the paper.',
    numberSliderProps: { min: 0, max: 1, step: 1e-4, size: 4 },
  },
  seed: {
    order: 6,
    type: 'custom',
    label: 'Seed',
    numberProps: {
      defaultNum: 1.0,
      numbersAfterDot: 5,
    },
    component: SeedCustomInput as any, //TODO: investigate later
  },
  pFuzz: {
    order: 7,
    type: 'number_slider',
    label: 'P Fuzz',
    tooltip:
      'P fuzz is the probability that Fuzziness will be as specified. This parameter is called p in the paper.',
    numberSliderProps: { min: 0, max: 1, step: 1e-4, size: 4 },
  },
} satisfies FormFieldsProps<typeof ACDefaults>;

export const ACForm = CreateForm({
  formDefaults: ACDefaults,
  formFields: ACFields,
  formPresets: ACPresets,
});
