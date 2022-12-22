import { MainPrimitiveType } from 'types/globalTypes';
import { bool } from 'yup';
import _ from 'lodash';

const capitalize = _.capitalize as <T extends string>(value: T) => Capitalize<Lowercase<T>>

type CapitalizedOption<T extends string> = {
  label: Capitalize<Lowercase<T>>;
  value: T;
};

const toCapitalizedOption: <T extends string>(value: T) => CapitalizedOption<T> = (value) => ({
  value,
  label: capitalize(value)
});

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

type FDAlgorithm = typeof FDAlgorithms[number];
type CFDAlgorithm = 'CTane';
type ARAlgorithm = 'Apriori';

const MFDAlgorithms = ['BRUTE', 'APPROX', 'CALIPERS'] as const;

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

const toCapitalizedAlgoOption = (algo: Algorithms): AlgoOption => ({
  value: algo,
  label: capitalize(algo) as Algorithms,
});

export const MFDAlgoOptions: AlgoOption[] = MFDAlgorithms.map(toCapitalizedAlgoOption);

export const optionsByPrimitive: Record<MainPrimitiveType, AlgoOption[]> = {
  [MainPrimitiveType.FD]: FDoptions,
  [MainPrimitiveType.AR]: ARoptions,
  [MainPrimitiveType.CFD]: CFDoptions,
  [MainPrimitiveType.TypoFD]: TypoOptions,
  [MainPrimitiveType.MFD]: MFDAlgoOptions,
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
  BRUTE: [], // Metric Algorithms
  APPROX: [], // Metric Algorithms
  CALIPERS: [], // Metric Algorithms
};

// ------------------------ METRIC FUNCTIONAL DEPENDENCIES ONLY PARAMETERS ---------------------------

// Metrics Options

const MFDMetrics = ['EUCLIDEAN', 'COSINE', 'LEVENSHTEIN'] as const;

export type MFDMetric = typeof MFDMetrics[number];

export type MFDMetricOption = CapitalizedOption<MFDMetric>;

export const MFDMetricOptions: MFDMetricOption[] = MFDMetrics.map(toCapitalizedOption);

export const metricOptionsByPrimitive: Record<MainPrimitiveType, MFDMetricOption[]> = {
  [MainPrimitiveType.FD]: [],
  [MainPrimitiveType.AR]: [],
  [MainPrimitiveType.CFD]: [],
  [MainPrimitiveType.TypoFD]: [],
  [MainPrimitiveType.MFD]: MFDMetricOptions,
  [MainPrimitiveType.Stats]: [] // Pechenux to reviewers: temporary solution
};

export const optionsByMetrics: Record<MFDMetric, string[]> = {
  EUCLIDEAN: [],
  COSINE: ['qgram'],
  LEVENSHTEIN: [],
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
  [MainPrimitiveType.MFD]: MFDColumnTypeOptions,
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
