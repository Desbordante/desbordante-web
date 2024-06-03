import { CFDFormInputs } from '@components/configure-algorithm/forms/CFDForm';
import { Presets } from 'types/form';

export const CFDPresets: Presets<CFDFormInputs> = {
  common: [
    {
      name: 'strict',
      displayName: 'Example preset',
      preset: {
        minConfidence: 1,
      },
    },
    {
      name: 'default',
      displayName: 'Default',
      preset: {
        algorithmName: 'CTane',
        minConfidence: 0,
        maxLHS: 1,
        minSupportCFD: 1,
      },
    },
  ],
  fileSpecific: [
    {
      fileNames: ['Workshop.csv'],
      presets: [
        {
          name: 'workshopexample',
          displayName: 'Workshop Example preset',
          preset: {
            minSupportCFD: 100,
          },
        },
      ],
    },
  ],
};
