import { MainPrimitiveType } from 'types/globalTypes';
import { bool } from 'yup';

const FDAlgorithms = [
  'Pyro',
  'TaneX',
  'FastFDs',
  'HyFD',
  'FD mine',
  'DFD',
  'Dep Miner',
  'FDep',
  'FUN',
] as const;

const MFDAlgorithms = [
  'Brute',
  'Approx',
  'Calipers',
] as const;

type FDAlgorithm = typeof FDAlgorithms[number];
type CFDAlgorithm = 'CTane';
type ARAlgorithm = 'Apriori';
type MFDAlgorithm = typeof MFDAlgorithms[number];


export type Algorithms = FDAlgorithm | CFDAlgorithm | ARAlgorithm | MFDAlgorithm;

type AlgoProps = 'arity' | 'threshold' | 'threads';

const toAlgoOption = (algo: Algorithms) => ({
  value: algo,
  label: algo,
});

export type AlgoOption = ReturnType<typeof toAlgoOption>;
export const FDoptions: AlgoOption[] = FDAlgorithms.map(toAlgoOption);
export const TypoOptions = FDoptions;
export const CFDoptions: AlgoOption[] = [toAlgoOption('CTane')];
export const ARoptions: AlgoOption[] = [toAlgoOption('Apriori')];
export const ApproxOptions: AlgoOption[] = [toAlgoOption('Pyro')];

export const MFDAlgoOptions: AlgoOption[] = [
  { label: 'Brute', value: 'Brute' },
  { label: 'Approx', value: 'Approx' },
  { label: 'Calipers', value: 'Calipers' },
];

export const optionsByPrimitive: Record<MainPrimitiveType, AlgoOption[]> = { // Maybe rename to algorithmOptions
  [MainPrimitiveType.FD]: FDoptions,
  [MainPrimitiveType.AR]: ARoptions,
  [MainPrimitiveType.CFD]: CFDoptions,
  [MainPrimitiveType.TypoFD]: TypoOptions,
  [MainPrimitiveType.MetricVerification]: MFDAlgoOptions,
};

export const optionsByAlgorithms: Record<Algorithms, AlgoProps[]> = {
  Pyro: ['threshold', 'arity', 'threads'],
  TaneX: ['threshold', 'arity'],
  FastFDs: ['threads'],
  HyFD: ['threads'],
  'FD mine': [],
  DFD: ['threads'],
  'Dep Miner': [],
  FDep: [],
  FUN: [],
  CTane: [],
  Apriori: [],
  Brute: [], // Metric Algorithms
  Approx: [], // Metric Algorithms
  Calipers: [], // Metric Algorithms
};

// ------------------------ METRIC FUNCTIONAL DEPENDENCIES ONLY PARAMETERS ---------------------------

// Metrics Options

export type MFDMetrics =
  | 'EUCLIDIAN'
  | 'COSINE'
  | 'LEVENHTEIN';

export type MFDMetricOption = {
  label: string;
  value: MFDMetrics;
};

export const MFDMetricOptions: MFDMetricOption[] = [
  { label: 'Euclidian', value: 'EUCLIDIAN' },
  { label: 'Cosine', value: 'COSINE' },
  { label: 'Levenhtein', value: 'LEVENHTEIN' },
];

export const metricOptionsByPrimitive: Record<MainPrimitiveType, MFDMetricOption[]> = {
  [MainPrimitiveType.FD]: [],
  [MainPrimitiveType.AR]: [],
  [MainPrimitiveType.CFD]: [],
  [MainPrimitiveType.TypoFD]: [],
  [MainPrimitiveType.MetricVerification]: MFDMetricOptions,
};

export const optionsByMetrics: Record<MFDMetrics, string[]> = {
  EUCLIDIAN: [],
  COSINE: ['qgram'],
  LEVENHTEIN: [],
};

// Column Types

export type MFDColumnTypes =
  | 'NUMERIC'
  | 'STRING';

export type MFDColumnTypeOption = {
  label: string;
  value: MFDColumnTypes;
};

export const MFDColumnTypeOptions: MFDColumnTypeOption[] = [
  { label: 'Numeric', value: 'NUMERIC' },
  { label: 'String', value: 'STRING' },
];

export const metricColumnTypeOptionsByPrimitive: Record<MainPrimitiveType, MFDColumnTypeOption[]> = {
  [MainPrimitiveType.FD]: [],
  [MainPrimitiveType.AR]: [],
  [MainPrimitiveType.CFD]: [],
  [MainPrimitiveType.TypoFD]: [],
  [MainPrimitiveType.MetricVerification]: MFDColumnTypeOptions,
};

export const optionsByColumnTypes: Record<MFDColumnTypes, string[]> = {
  NUMERIC: [],
  STRING: [],
};

// Distance to Null

export type MFDDistances =
  | 'Infinity'
  | 'Zero';

export type MFDDistancesOption = {
  label: MFDDistances;
  value: boolean;
};

export const MFDDistancesOptions: MFDDistancesOption[] = [
  { label: 'Infinity', value: true },
  { label: 'Zero', value: false },
];
