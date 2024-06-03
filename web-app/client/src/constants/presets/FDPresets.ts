import { FDFormInputs } from '@components/configure-algorithm/forms/FDForm';
import { Presets } from 'types/form';

export const FDPresets: Presets<FDFormInputs> = {
  common: [
    {
      name: 'strict',
      displayName: 'Strict preset',
      preset: {
        errorThreshold: 0,
      },
    },
    {
      name: 'default',
      displayName: 'Default',
      preset: {
        algorithmName: 'Pyro',
        errorThreshold: 1,
        maxLHS: 1,
        threadsCount: 1,
      },
    },
  ],
  fileSpecific: [
    {
      fileNames: ['breast_cancer.csv'],
      presets: [
        {
          name: 'breastcancerexample',
          displayName: 'Breast Cancer Example preset',
          preset: {
            errorThreshold: 0.03,
          },
        },
      ],
    },
  ],
};
