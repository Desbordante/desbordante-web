import { useQuery } from '@apollo/client';
import { useEffect, useMemo } from 'react';
import badgeStyles from '@components/Inputs/MultiSelect/OptionBadge/OptionBadge.module.scss';
import {
  MFDAlgoOptions,
  MFDColumnType,
  MFDColumnTypeOptions,
  MFDDistancesOptions,
  MFDMetricOption,
  MFDMetricOptions,
  optionsByMetrics,
} from '@constants/options';
import {
  getCountOfColumns,
  getCountOfColumns_datasetInfo_statsInfo_stats,
  getCountOfColumnsVariables,
} from '@graphql/operations/queries/__generated__/getCountOfColumns';
import { GET_COUNT_OF_COLUMNS } from '@graphql/operations/queries/getDatasetColumnCount';
import { showError } from '@utils/toasts';
import {
  Defaults,
  FormFieldsProps,
  CreateFormProcessor,
  CreateForm,
  FormSelectOptions,
  FormHook,
  Presets,
} from 'types/form';
import { OptionWithBadges } from 'types/multiSelect';

const TypesCategories: Record<string, string> = {
  Int: 'Numeric',
  Double: 'Numeric',
  BigInt: 'Numeric',
  String: 'String',
};

const MFDDefaults = {
  algorithmName: 'MetricVerification',
  lhsIndices: [] as number[],
  rhsIndices: [] as number[],
  rhsColumnType: 'Numeric',
  metric: 'EUCLIDEAN',
  metricAlgorithm: 'BRUTE',
  parameter: 1.0,
  q: 1,
  distanceToNullIsInfinity: false as boolean,
  columnMode: 'manual',
} satisfies Defaults;

const MFDPresets: Presets<typeof MFDDefaults> = [
  {
    filenames: ['MetricMovies.csv'],
    presetName: 'Metric Dependency Violated (tiny radius)',
    preset: {
      lhsIndices: [1] as number[],
      rhsIndices: [2] as number[],
    },
  },
  {
    filenames: ['MetricMovies.csv'],
    presetName: 'Metric Dependency Violated (medium radius)',
    preset: {
      lhsIndices: [1] as number[],
      rhsIndices: [2] as number[],
      parameter: 3,
    },
  },
  {
    filenames: ['MetricMovies.csv'],
    presetName: 'Metric Dependency Violated (large radius)',
    preset: {
      lhsIndices: [1] as number[],
      rhsIndices: [2] as number[],
      parameter: 6,
    },
  },
  {
    filenames: ['MetricMovies.csv'],
    presetName: 'Metric Dependency Satisfied',
    preset: {
      lhsIndices: [1] as number[],
      rhsIndices: [2] as number[],
      parameter: 7,
    },
  },
  {
    filenames: ['MetricAddresses.csv'],
    presetName: 'Metric Cosine Violated (Strictest)',
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
    filenames: ['MetricAddresses.csv'],
    presetName: 'Metric Cosine Violated (Strict)',
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
    filenames: ['MetricAddresses.csv'],
    presetName: 'Metric Cosine Violated (Relaxed)',
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
    filenames: ['MetricAddresses.csv'],
    presetName: 'Metric Cosine Satisfied',
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
    filenames: ['MetricAddresses.csv'],
    presetName: 'Metric Levenshtein Violated (Strictest)',
    preset: {
      lhsIndices: [1] as number[],
      rhsIndices: [2] as number[],
      rhsColumnType: 'String',
      metric: 'LEVENSHTEIN',
      parameter: 0,
    },
  },
  {
    filenames: ['MetricAddresses.csv'],
    presetName: 'Metric Levenshtein Violated (Strict)',
    preset: {
      lhsIndices: [1] as number[],
      rhsIndices: [2] as number[],
      rhsColumnType: 'String',
      metric: 'LEVENSHTEIN',
      parameter: 3,
    },
  },
  {
    filenames: ['MetricAddresses.csv'],
    presetName: 'Metric Levenshtein Violated (Relaxed)',
    preset: {
      lhsIndices: [1] as number[],
      rhsIndices: [2] as number[],
      rhsColumnType: 'String',
      metric: 'LEVENSHTEIN',
      parameter: 6,
    },
  },
  {
    filenames: ['MetricAddresses.csv'],
    presetName: 'Metric Levenshtein Satisfied',
    preset: {
      lhsIndices: [1] as number[],
      rhsIndices: [2] as number[],
      rhsColumnType: 'String',
      metric: 'LEVENSHTEIN',
      parameter: 10,
    },
  },
  {
    filenames: ['MetricCoords.csv'],
    presetName: 'Metric Calipers Violated (Strictest)',
    preset: {
      lhsIndices: [1] as number[],
      rhsIndices: [2, 3] as number[],
      metricAlgorithm: 'CALIPERS',
      parameter: 0.002,
    },
  },
  {
    filenames: ['MetricCoords.csv'],
    presetName: 'Metric Calipers Violated (Strict)',
    preset: {
      lhsIndices: [1] as number[],
      rhsIndices: [2, 3] as number[],
      metricAlgorithm: 'CALIPERS',
      parameter: 0.007,
    },
  },
  {
    filenames: ['MetricCoords.csv'],
    presetName: 'Metric Calipers Violated (Relaxed)',
    preset: {
      lhsIndices: [1] as number[],
      rhsIndices: [2, 3] as number[],
      metricAlgorithm: 'CALIPERS',
      parameter: 0.04,
    },
  },
  {
    filenames: ['MetricCoords.csv'],
    presetName: 'Metric Calipers Satisfied',
    preset: {
      lhsIndices: [1] as number[],
      rhsIndices: [2, 3] as number[],
      metricAlgorithm: 'CALIPERS',
      parameter: 0.065,
    },
  },
];

// For future developers: methods.setError DOES NOT PREVENT FORM SUBMIT
const MFDFields = {
  algorithmName: {
    order: 0,
    type: 'hidden_value',
    label: '',
    isDisplayable: false,
  },
  lhsIndices: {
    order: 1,
    type: 'multi_select',
    label: 'LHS Columns',
    options: [] as FormSelectOptions,
    isLoading: true as boolean,
    rules: {
      validate: (value) => {
        if (Array.isArray(value))
          return value.length > 0 ? undefined : 'Cannot be empty';
        return undefined;
      },
    },
  },
  rhsIndices: {
    order: 2,
    type: 'multi_select',
    label: 'RHS Columns',
    options: [] as FormSelectOptions,
    isLoading: true as boolean,
    rules: {
      validate: (value, formState) => {
        if (Array.isArray(value) && value.length === 0)
          return 'Cannot be empty';

        if (formState.columnMode === 'error') return 'Choose different columns';

        if (formState.columnMode === 'errorMixTypes')
          return 'Columns must have one type';

        if (
          Array.isArray(formState.rhsIndices) &&
          formState.rhsColumnType === 'String' &&
          formState.rhsIndices.length > 1
        )
          return 'Must contain only one column of type "String"';
        return undefined;
      },
    },
  },
  rhsColumnType: {
    order: 3,
    type: 'select',
    label: 'RHS column type',
    isLoading: false,
    disabled: false as boolean,
    clientOnly: true,
    options: MFDColumnTypeOptions,
  },
  metric: {
    order: 4,
    type: 'select',
    label: 'Metric',
    isLoading: false,
    options: MFDMetricOptions,
    rules: {
      validate: (value, formState) => {
        return formState.rhsColumnType == 'Numeric' && value != 'EUCLIDEAN'
          ? 'Must be Euclidean if column type is numeric'
          : formState.rhsColumnType != 'Numeric' && value == 'EUCLIDEAN'
            ? "Can't be Euclidean if column type is not numeric"
            : undefined;
      },
    },
  },
  metricAlgorithm: {
    order: 5,
    type: 'select',
    label: 'Algorithm',
    isLoading: false,
    disabled: false as boolean,
    options: MFDAlgoOptions,
    rules: {
      validate: (value, formState) => {
        if (Array.isArray(formState.rhsIndices))
          return formState.metricAlgorithm == 'CALIPERS' &&
            ((formState.rhsColumnType as MFDColumnType) != 'Numeric' ||
              formState.rhsIndices.length !== 2)
            ? 'Count of RHS Columns must be 2'
            : undefined;
        return undefined;
      },
    },
  },
  parameter: {
    order: 6,
    type: 'number_input',
    label: 'Tolerance parameter',
    numberInputProps: { defaultNum: 1.0, min: 0 },
  },
  q: {
    order: 7,
    type: 'number_input',
    label: 'Q-gram length',
    disabled: false as boolean,
    numberInputProps: {
      defaultNum: 1.0,
      min: 1,
      includingMin: true,
      numbersAfterDot: 0,
    },
  },
  distanceToNullIsInfinity: {
    order: 8,
    type: 'select',
    label: 'Distance to null',
    isLoading: false,
    options: MFDDistancesOptions,
  },
  columnMode: {
    order: 9,
    type: 'hidden_value',
    label: '',
    isDisplayable: false,
    clientOnly: true,
  },
} satisfies FormFieldsProps<typeof MFDDefaults>;

const useMFDFormHook: FormHook<typeof MFDDefaults, typeof MFDFields> = (
  fileID,
  form,
  setForm,
) => {
  const { loading, data } = useQuery<
    getCountOfColumns,
    getCountOfColumnsVariables
  >(GET_COUNT_OF_COLUMNS, {
    variables: { fileID },
    onError: (error) => {
      showError(
        error.message,
        "Can't fetch columns information. Please try later.",
      );
    },
  });

  const columnData = useMemo(() => {
    if (data) {
      const countOfColumns: number = data?.datasetInfo?.countOfColumns || 0;
      const statistics: getCountOfColumns_datasetInfo_statsInfo_stats[] =
        data?.datasetInfo?.statsInfo.stats || [];
      const hasHeader: boolean = data?.datasetInfo?.hasHeader || false;
      const headers: string[] = data?.datasetInfo?.header || [];

      return [...Array(countOfColumns)].map((_, i) => ({
        label: hasHeader ? `${i + 1}: ${headers[i]}` : `Column ${i + 1}`,
        value: i,
        badges: statistics
          .filter((elem) => elem.column.index == i)
          .map((elem) => ({ label: elem.type, style: badgeStyles.primary })),
      })) as OptionWithBadges[];
    }
    return [] as OptionWithBadges[];
  }, [data]);

  useEffect(() => {
    if (columnData) {
      setForm((formSnapshot) => {
        formSnapshot.lhsIndices.isLoading = loading;
        formSnapshot.rhsIndices.isLoading = loading;
        formSnapshot.lhsIndices.options = columnData;
        formSnapshot.rhsIndices.options = columnData;
        return { ...formSnapshot };
      });
    }
  }, [columnData, loading, setForm]);
};

const MFDProcessor = CreateFormProcessor<typeof MFDDefaults, typeof MFDFields>(
  (form, setForm, methods, depsIndexRef) => {
    const RHSValues = methods.getValues('rhsIndices') || [];
    const ColumnData = form.lhsIndices.options || [];
    const Metric = methods.getValues('metric') as MFDMetricOption['value'];
    const ColumnMode = methods.getValues('columnMode');

    depsIndexRef.current = 0;

    function fillFormParameters() {
      setForm((formSnapshot) => {
        formSnapshot.rhsColumnType.disabled = ColumnMode === 'auto';

        formSnapshot.q.disabled =
          !optionsByMetrics[
            MFDMetricOptions.find((option) => option.value === Metric)?.label ||
              'Euclidean'
          ].includes('qgram');
        return { ...formSnapshot };
      });
    }

    if (
      ColumnData.length === 0 ||
      ColumnData.some((elem) => (elem.badges ?? []).length == 0)
    ) {
      methods.setValue('columnMode', 'manual');
      fillFormParameters();
      return;
    }

    const types = Array.from(
      ColumnData && ColumnData.length
        ? new Set<string>(
            RHSValues.map(
              (elem) =>
                TypesCategories[
                  ColumnData?.[elem].badges?.[0].label || 'NotValid'
                ] || 'Undefined',
            ),
          )
        : [],
    );

    if (types.length === 0) {
      methods.setValue('columnMode', 'manual');
    } else if (types.length === 1) {
      if (['Numeric', 'String'].includes(types[0])) {
        depsIndexRef.current = 1;
        methods.setValue('columnMode', 'auto');
        methods.setValue('rhsColumnType', types[0]);
      } else {
        methods.setValue('columnMode', 'error');
      }
    } else {
      methods.setValue('columnMode', 'errorMixTypes');
    }

    fillFormParameters();
  },
  [
    ['rhsIndices', 'rhsColumnType', 'metric', 'metricAlgorithm'],
    ['rhsIndices', 'metric', 'metricAlgorithm'],
  ],
);

export const MFDForm = CreateForm({
  formDefaults: MFDDefaults,
  formFields: MFDFields,
  formPresets: MFDPresets,
  useFormHook: useMFDFormHook,
  formProcessor: MFDProcessor,
});
