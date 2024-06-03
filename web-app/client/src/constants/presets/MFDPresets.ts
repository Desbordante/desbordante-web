import { MFDFormInputs } from '@components/configure-algorithm/forms/MFDForm';
import { Presets } from 'types/form';

export const MFDPresets: Presets<MFDFormInputs> = {
  common: [
    {
      name: 'default',
      displayName: 'Default',
      preset: {
        lhsIndices: [],
        rhsIndices: [],
        rhsColumnType: 'Numeric',
        metric: 'EUCLIDEAN',
        metricAlgorithm: 'BRUTE',
        parameter: 1.0,
        q: 1,
        distanceToNullIsInfinity: false,
      },
    },
  ],
  fileSpecific: [
    {
      fileNames: ['MetricMovies.csv'],
      presets: [
        {
          name: 'metricmovies_dv_s',
          displayName: 'Metric Dependency Violated (tiny radius)',
          preset: {
            lhsIndices: [1] as number[],
            rhsIndices: [2] as number[],
          },
        },
        {
          name: 'metricmovies_dv_m',
          displayName: 'Metric Dependency Violated (medium radius)',
          preset: {
            lhsIndices: [1] as number[],
            rhsIndices: [2] as number[],
            parameter: 3,
          },
        },
        {
          name: 'metricmovies_dv_l',
          displayName: 'Metric Dependency Violated (large radius)',
          preset: {
            lhsIndices: [1] as number[],
            rhsIndices: [2] as number[],
            parameter: 6,
          },
        },
        {
          name: 'metricmovies_sat',
          displayName: 'Metric Dependency Satisfied',
          preset: {
            lhsIndices: [1] as number[],
            rhsIndices: [2] as number[],
            parameter: 7,
          },
        },
      ],
    },
    {
      fileNames: ['MetricAddresses.csv'],
      presets: [
        {
          name: 'metricaddresses_cv_st',
          displayName: 'Metric Cosine Violated (Strictest)',
          preset: {
            lhsIndices: [1] as number[],
            rhsIndices: [2] as number[],
            rhsColumnType: 'String',
            metric: 'COSINE',
            parameter: 0.04,
            q: 2,
          },
        },
        {
          name: 'metricaddresses_cv_s',
          displayName: 'Metric Cosine Violated (Strict)',
          preset: {
            lhsIndices: [1] as number[],
            rhsIndices: [2] as number[],
            rhsColumnType: 'String',
            metric: 'COSINE',
            parameter: 0.1,
            q: 2,
          },
        },
        {
          name: 'metricaddresses_cv_r',
          displayName: 'Metric Cosine Violated (Relaxed)',
          preset: {
            lhsIndices: [1] as number[],
            rhsIndices: [2] as number[],
            rhsColumnType: 'String',
            metric: 'COSINE',
            parameter: 0.14,
            q: 2,
          },
        },
        {
          name: 'metricaddresses_cv_sat',
          displayName: 'Metric Cosine Satisfied',
          preset: {
            lhsIndices: [1] as number[],
            rhsIndices: [2] as number[],
            rhsColumnType: 'String',
            metric: 'COSINE',
            parameter: 0.19,
            q: 2,
          },
        },
        {
          name: 'metricaddresses_lv_st',
          displayName: 'Metric Levenshtein Violated (Strictest)',
          preset: {
            lhsIndices: [1] as number[],
            rhsIndices: [2] as number[],
            rhsColumnType: 'String',
            metric: 'LEVENSHTEIN',
            parameter: 0,
          },
        },
        {
          name: 'metricaddresses_lv_s',
          displayName: 'Metric Levenshtein Violated (Strict)',
          preset: {
            lhsIndices: [1] as number[],
            rhsIndices: [2] as number[],
            rhsColumnType: 'String',
            metric: 'LEVENSHTEIN',
            parameter: 3,
          },
        },
        {
          name: 'metricaddresses_lv_r',
          displayName: 'Metric Levenshtein Violated (Relaxed)',
          preset: {
            lhsIndices: [1] as number[],
            rhsIndices: [2] as number[],
            rhsColumnType: 'String',
            metric: 'LEVENSHTEIN',
            parameter: 6,
          },
        },
        {
          name: 'metricaddresses_lv_sat',
          displayName: 'Metric Levenshtein Satisfied',
          preset: {
            lhsIndices: [1] as number[],
            rhsIndices: [2] as number[],
            rhsColumnType: 'String',
            metric: 'LEVENSHTEIN',
            parameter: 10,
          },
        },
      ],
    },
    {
      fileNames: ['MetricCoords.csv'],
      presets: [
        {
          name: 'metriccoords_cv_st',
          displayName: 'Metric Calipers Violated (Strictest)',
          preset: {
            lhsIndices: [1] as number[],
            rhsIndices: [2, 3] as number[],
            metricAlgorithm: 'CALIPERS',
            parameter: 0.002,
          },
        },
        {
          name: 'metriccoords_cv_s',
          displayName: 'Metric Calipers Violated (Strict)',
          preset: {
            lhsIndices: [1] as number[],
            rhsIndices: [2, 3] as number[],
            metricAlgorithm: 'CALIPERS',
            parameter: 0.007,
          },
        },
        {
          name: 'metriccoords_cv_e',
          displayName: 'Metric Calipers Violated (Relaxed)',
          preset: {
            lhsIndices: [1] as number[],
            rhsIndices: [2, 3] as number[],
            metricAlgorithm: 'CALIPERS',
            parameter: 0.04,
          },
        },
        {
          name: 'metriccoords_cv_sat',
          displayName: 'Metric Calipers Satisfied',
          preset: {
            lhsIndices: [1] as number[],
            rhsIndices: [2, 3] as number[],
            metricAlgorithm: 'CALIPERS',
            parameter: 0.065,
          },
        },
      ],
    },
  ],
};
