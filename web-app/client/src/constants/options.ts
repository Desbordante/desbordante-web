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

export const MFDAlgoOptions: AlgoOption[] = MFDAlgorithms.map(toAlgoOption);

export const optionsByPrimitive: Record<MainPrimitiveType, AlgoOption[]> = {
  [MainPrimitiveType.FD]: FDoptions,
  [MainPrimitiveType.AR]: ARoptions,
  [MainPrimitiveType.CFD]: CFDoptions,
  [MainPrimitiveType.TypoFD]: TypoOptions,
  [MainPrimitiveType.MetricVerification]: MFDAlgoOptions,
  [MainPrimitiveType.Stats]: [], // Pechenux to reviewers: temporary solution
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

const MFDMetrics = ['Euclidean', 'Cosine', 'Levenshtein'] as const;

export type MFDMetric = typeof MFDMetrics[number];


export type MFDMetricOption = {
  label: string;
  value: MFDMetric;
};

// Pechenux: I implemented a simpler solution. I am waiting for an response about this
// export const MFDMetricOptions: MFDMetricOption[] = [
//   { label: 'Euclidean', value: 'EUCLIDEAN' },
//   { label: 'Cosine', value: 'COSINE' },
//   { label: 'Levenshtein', value: 'LEVENSHTEIN' },
// ];

const toMetricOption = (metric: MFDMetric) => ({
  value: metric,
  label: metric,
});

export const MFDMetricOptions: MFDMetricOption[] = MFDMetrics.map(toMetricOption);

export const metricOptionsByPrimitive: Record<MainPrimitiveType, MFDMetricOption[]> = {
  [MainPrimitiveType.FD]: [],
  [MainPrimitiveType.AR]: [],
  [MainPrimitiveType.CFD]: [],
  [MainPrimitiveType.TypoFD]: [],
  [MainPrimitiveType.MetricVerification]: MFDMetricOptions,
  [MainPrimitiveType.Stats]: [] // Pechenux to reviewers: temporary solution
};

export const optionsByMetrics: Record<MFDMetric, string[]> = {
  Euclidean: [],
  Cosine: ['qgram'],
  Levenshtein: [],
};

// Column Types

export type MFDColumnType =
  | 'Numeric'
  | 'String';

export type MFDColumnTypeOption = {
  label: string;
  value: MFDColumnType;
};

export const MFDColumnTypeOptions: MFDColumnTypeOption[] = [
  { label: 'Numeric', value: 'Numeric' },
  { label: 'String', value: 'String' },
];

export const metricColumnTypeOptionsByPrimitive: Record<MainPrimitiveType, MFDColumnTypeOption[]> = {
  [MainPrimitiveType.FD]: [],
  [MainPrimitiveType.AR]: [],
  [MainPrimitiveType.CFD]: [],
  [MainPrimitiveType.TypoFD]: [],
  [MainPrimitiveType.MetricVerification]: MFDColumnTypeOptions,
  [MainPrimitiveType.Stats]: [] // Pechenux to reviewers: temporary solution
};

export const optionsByColumnTypes: Record<MFDColumnType, string[]> = {
  Numeric: [],
  String: [],
};

// Distance to Null

export type MFDDistance =
  | 'Infinity'
  | 'Zero';

export type MFDDistancesOption = {
  label: MFDDistance;
  value: boolean;
};

export const MFDDistancesOptions: MFDDistancesOption[] = [
  { label: 'Infinity', value: true },
  { label: 'Zero', value: false },
];
