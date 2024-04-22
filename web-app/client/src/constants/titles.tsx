import {
  AROrderingParameter,
  CFDOrderingParameter,
  FDOrderingParameter,
  PrimitiveType,
} from 'types/globalTypes';

export const OrderingTitles: Record<PrimitiveType, Record<string, string>> = {
  [PrimitiveType.FD]: {
    [FDOrderingParameter.LHS_NAME]: 'LHS NAME',
    [FDOrderingParameter.RHS_NAME]: 'RHS NAME',
  },
  [PrimitiveType.CFD]: {
    [CFDOrderingParameter.LHS_COL_NAME]: 'LHS NAME',
    [CFDOrderingParameter.RHS_COL_NAME]: 'RHS NAME',
    [CFDOrderingParameter.CONF]: 'Condfidence',
    [CFDOrderingParameter.LHS_PATTERN]: 'LHS PATTERN',
    [CFDOrderingParameter.LHS_PATTERN]: 'RHS PATTERN',
  },
  [PrimitiveType.AR]: {
    [AROrderingParameter.CONF]: 'Confidence',
    [AROrderingParameter.DEFAULT]: 'Default',
    [AROrderingParameter.LHS_NAME]: 'LHS NAME',
    [AROrderingParameter.RHS_NAME]: 'RHS NAME',
  },
  [PrimitiveType.TypoFD]: {
    [FDOrderingParameter.LHS_NAME]: 'LHS NAME',
    [FDOrderingParameter.RHS_NAME]: 'RHS NAME',
  },
  [PrimitiveType.TypoCluster]: {
    [FDOrderingParameter.LHS_NAME]: 'LHS NAME',
    [FDOrderingParameter.RHS_NAME]: 'RHS NAME',
  },
};
