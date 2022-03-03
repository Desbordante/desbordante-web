import { ARAlgorithm, CFDAlgorithm, EDPAlgorithm, FDAlgorithm } from "./types";

export type FDAlgorithmProps = {
  algorithm?: FDAlgorithm;
  errorThreshold?: string;
  arityConstraint?: string;
  threadsCount?: string;
};

export type CFDAlgorithmProps = {
  algorithm?: CFDAlgorithm;
  arityConstraint?: string;
  minSupport?: string;
  minConfidence?: string;
};

export type ARAlgorithmProps = {
  algorithm?: ARAlgorithm;
  minSupport?: string;
  minConfidence?: string;
};

export type EDPAlgorithmProps = {
  algorithm?: EDPAlgorithm;
  exact?: FDAlgorithmProps;
  approximate?: FDAlgorithmProps;
};

export type AlgorithmProps = FDAlgorithmProps &
  CFDAlgorithmProps &
  ARAlgorithmProps &
  EDPAlgorithmProps;
