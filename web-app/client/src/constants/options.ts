import { MainPrimitiveType } from 'types/globalTypes';

export type Algorithms =
  | 'Pyro'
  | 'TaneX'
  | 'FastFDs'
  | 'FD mine'
  | 'DFD'
  | 'Dep Miner'
  | 'FDep'
  | 'FUN'
  | 'CTane'
  | 'Apriori';

export type AlgoOption = {
  value: Algorithms;
  label: Algorithms;
};

export const FDoptions: AlgoOption[] = [
  { label: 'Pyro', value: 'Pyro' },
  { label: 'TaneX', value: 'TaneX' },
  { label: 'FastFDs', value: 'FastFDs' },
  { label: 'FD mine', value: 'FD mine' },
  { label: 'DFD', value: 'DFD' },
  { label: 'Dep Miner', value: 'Dep Miner' },
  { label: 'FDep', value: 'FDep' },
  { label: 'FUN', value: 'FUN' },
];
export const CFDoptions: AlgoOption[] = [{ label: 'CTane', value: 'CTane' }];
export const ARoptions: AlgoOption[] = [{ label: 'Apriori', value: 'Apriori' }];
export const ApproxOptions: AlgoOption[] = [{ label: 'Pyro', value: 'Pyro' }];
export const TypoOptions: AlgoOption[] = [
  { label: 'FastFDs', value: 'FastFDs' },
  { label: 'FD mine', value: 'FD mine' },
  { label: 'DFD', value: 'DFD' },
  { label: 'Dep Miner', value: 'Dep Miner' },
  { label: 'FDep', value: 'FDep' },
  { label: 'FUN', value: 'FUN' },
];

export const optionsByPrimitive: Record<MainPrimitiveType, AlgoOption[]> = {
  [MainPrimitiveType.FD]: FDoptions,
  [MainPrimitiveType.AR]: ARoptions,
  [MainPrimitiveType.CFD]: CFDoptions,
  [MainPrimitiveType.TypoFD]: TypoOptions,
};

export const optionsByAlgorithms: Record<Algorithms, string[]> = {
  Pyro: ['threshold', 'arity', 'threads'],
  TaneX: ['threshold', 'arity'],
  FastFDs: ['threads'],
  'FD mine': [],
  DFD: ['threads'],
  'Dep Miner': [],
  FDep: [],
  FUN: [],
  CTane: [],
  Apriori: [],
};
