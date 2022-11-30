import { MainPrimitiveType } from 'types/globalTypes';

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

export type Algorithms = FDAlgorithm | CFDAlgorithm | ARAlgorithm;

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

export const optionsByPrimitive: Record<MainPrimitiveType, AlgoOption[]> = {
  [MainPrimitiveType.FD]: FDoptions,
  [MainPrimitiveType.AR]: ARoptions,
  [MainPrimitiveType.CFD]: CFDoptions,
  [MainPrimitiveType.TypoFD]: TypoOptions,
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
};
