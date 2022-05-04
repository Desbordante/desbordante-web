import { ARAlgorithm, CFDAlgorithm, EDPAlgorithm, FDAlgorithm } from "./types";
import { MetricType } from "./globalTypes";

export type FDAlgorithmProps = {
  algorithm?: FDAlgorithm;
  errorThreshold: string;
  arityConstraint: string;
  threadsCount: string;
};

export type CFDAlgorithmProps = {
  algorithm?: CFDAlgorithm;
  arityConstraint: string;
  minSupportCFD: string;
  minConfidence: string;
};

export type ARAlgorithmProps = {
  algorithm?: ARAlgorithm;
  minSupportAR: string;
  minConfidence: string;
};

export type EDPAlgorithmProps = {
  algorithm?: EDPAlgorithm;
  preciseAlgorithm?: FDAlgorithm;
  approximateAlgorithm?: FDAlgorithm;
  metric: MetricType;
  radius: string;
  ratio: string;
};

export type AlgorithmProps = FDAlgorithmProps &
  CFDAlgorithmProps &
  ARAlgorithmProps &
  EDPAlgorithmProps;
