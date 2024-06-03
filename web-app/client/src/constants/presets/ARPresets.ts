import { ARFormInputs } from '@components/configure-algorithm/forms/ARForm';
import { Presets } from 'types/form';

export const ARPresets: Presets<ARFormInputs> = {
  common: [
    {
      name: 'strict',
      displayName: 'Strict',
      preset: {
        minConfidence: 1,
      },
    },
    {
      name: 'default',
      displayName: 'Default',
      preset: {
        algorithmName: 'Apriori',
        minConfidence: 0,
        minSupportAR: 0,
      },
    },
  ],
  fileSpecific: [
    {
      fileNames: ['rules-kaggle-rows-2.csv'],
      presets: [
        {
          name: 'kaggleexample',
          displayName: 'Kaggle Example preset',
          preset: {
            minConfidence: 0.5,
            minSupportAR: 0.1,
          },
        },
      ],
    },
  ],
};
