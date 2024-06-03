import { TypoFDFormInputs } from '@components/configure-algorithm/forms/TypoFDForm';
import { Presets } from 'types/form';

export const TypoFDPresets: Presets<TypoFDFormInputs> = {
  common: [
    {
      name: 'default',
      displayName: 'Default',
      preset: {
        preciseAlgorithm: 'FastFDs',
        approximateAlgorithm: 'Pyro',
        maxLHS: 5,
        errorThreshold: 0.1,
        threadsCount: 2,
        defaultRadius: 3,
        defaultRatio: 1,
      },
    },
  ],
  fileSpecific: [
    {
      fileNames: ['SimpleTypos.csv'],
      presets: [
        {
          name: 'simpletyposexample',
          displayName: 'Simple Typos Example preset',
          preset: {
            defaultRadius: -1,
          },
        },
      ],
    },
  ],
};
