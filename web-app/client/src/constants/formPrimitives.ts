import { ARForm } from '@constants/configuratorForm/ARForm';
import { CFDForm } from '@constants/configuratorForm/CFDForm';
import { FDForm } from '@constants/configuratorForm/FDForm';
import { MFDForm } from '@constants/configuratorForm/MFDForm';
import { ACForm } from '@constants/configuratorForm/ACForm';
import { TypoFDForm } from '@constants/configuratorForm/TypoFDForm';
import { MainPrimitiveType } from 'types/globalTypes';

const primitives = {
  [MainPrimitiveType.FD]: FDForm,
  [MainPrimitiveType.AR]: ARForm,
  [MainPrimitiveType.CFD]: CFDForm,
  [MainPrimitiveType.TypoFD]: TypoFDForm,
  [MainPrimitiveType.MFD]: MFDForm,
  [MainPrimitiveType.AC]: ACForm,
};
const excludedPrimitives = [MainPrimitiveType.Stats];

export default primitives;
export { excludedPrimitives };
export type UsedPrimitivesType = keyof typeof primitives;
export type FormObjectsType = (typeof primitives)[UsedPrimitivesType];
