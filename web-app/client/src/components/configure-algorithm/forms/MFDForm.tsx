import { useQuery } from '@apollo/client';
import _ from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import badgeStyles from '@components/common/uikit/Inputs/MultiSelect/OptionBadge/OptionBadge.module.scss';
import { ControlledNumberInput } from '@components/common/uikit/Inputs/NumberInput';
import { ControlledSelect } from '@components/common/uikit/Inputs/Select';
import {
  MFDAlgoOptions,
  MFDColumnType,
  MFDColumnTypeOptions,
  MFDDistancesOptions,
  MFDMetricOption,
  MFDMetricOptions,
  optionsByMetrics,
} from '@constants/options';
import { MFDPresets } from '@constants/presets/MFDPresets';
import {
  getCountOfColumns,
  getCountOfColumns_datasetInfo_statsInfo_stats,
  getCountOfColumnsVariables,
} from '@graphql/operations/queries/__generated__/getCountOfColumns';
import { GET_COUNT_OF_COLUMNS } from '@graphql/operations/queries/getDatasetColumnCount';
import { showError } from '@utils/toasts';
import { OptionWithBadges } from 'types/multiSelect';
import ControlledMultiSelect from '../../common/uikit/Inputs/MultiSelect/ControlledMultiSelect';
import { FormComponent } from '../types/form';

export type MFDFormInputs = {
  lhsIndices: number[];
  rhsIndices: number[];
  rhsColumnType: MFDColumnType;
  metric: MFDMetricOption['value'];
  metricAlgorithm: 'BRUTE' | 'APPROX' | 'CALIPERS';
  parameter: number;
  q: number;
  distanceToNullIsInfinity: boolean;
};

const TypesCategories: Record<string, string> = {
  Int: 'Numeric',
  Double: 'Numeric',
  BigInt: 'Numeric',
  String: 'String',
};

const MFDForm: FormComponent<MFDFormInputs> = ({ fileID, setPresets }) => {
  const methods = useFormContext<MFDFormInputs>();

  const [rhsColumnType] = useWatch({
    name: ['rhsColumnType'],
  });
  const [metric, rhsIndices] = useWatch({
    name: ['metric', 'rhsIndices'],
  });

  useEffect(() => {
    methods.trigger(['metric']);
  }, [methods, rhsColumnType]);
  useEffect(() => {
    methods.trigger(['metricAlgorithm']);
  }, [methods, rhsIndices, rhsColumnType]);

  const qDisabled = useMemo(
    () =>
      !optionsByMetrics[
        MFDMetricOptions.find((option) => option.value === metric)?.label ||
          'Euclidean'
      ].includes('qgram'),
    [metric],
  );

  useEffect(() => {
    setPresets(MFDPresets);
  }, [setPresets]);

  const [columnMode, setColumnMode] = useState<
    'manual' | 'auto' | 'error' | 'errorMixTypes'
  >('manual');

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
    methods.trigger(['rhsIndices']);
  }, [columnMode, methods, rhsColumnType]);

  useEffect(() => {
    if (
      !Array.isArray(rhsIndices) ||
      columnData.length === 0 ||
      columnData.some((elem) => (elem.badges ?? []).length == 0)
    ) {
      setColumnMode('manual');
      return;
    }

    const types = Array.from(
      new Set<string>(
        rhsIndices.map(
          (elem) =>
            TypesCategories[columnData[elem].badges?.[0].label || 'NotValid'] ||
            'Undefined',
        ),
      ),
    );

    if (types.length === 0) {
      setColumnMode('manual');
    } else if (types.length === 1) {
      const columnType = types[0];
      if ('Numeric' === columnType || 'String' === columnType) {
        setColumnMode('auto');
        methods.setValue('rhsColumnType', columnType);
      } else {
        setColumnMode('error');
      }
    } else {
      setColumnMode('errorMixTypes');
    }
  }, [columnData, methods, rhsIndices]);

  return (
    <>
      <ControlledMultiSelect
        label="LHS Columns"
        controlName="lhsIndices"
        control={methods.control}
        rules={{
          validate: (value) => {
            if (Array.isArray(value))
              return value.length > 0 ? undefined : 'Cannot be empty';
            return undefined;
          },
        }}
        isLoading={loading}
        options={columnData}
      />
      <ControlledMultiSelect
        label="RHS Columns"
        controlName="rhsIndices"
        control={methods.control}
        rules={{
          validate: (value, formState) => {
            if (Array.isArray(value) && value.length === 0)
              return 'Cannot be empty';

            if (columnMode === 'error') return 'Choose different columns';

            if (columnMode === 'errorMixTypes')
              return 'Columns must have one type';

            if (
              Array.isArray(value) &&
              formState.rhsColumnType === 'String' &&
              value.length > 1
            )
              return 'Must contain only one column of type "String"';
            return undefined;
          },
        }}
        isLoading={loading}
        options={columnData}
      />
      <ControlledSelect
        label="RHS column type"
        controlName="rhsColumnType"
        control={methods.control}
        isDisabled={columnMode === 'auto'}
        options={MFDColumnTypeOptions}
      />
      <ControlledSelect
        label="Metric"
        controlName="metric"
        control={methods.control}
        options={MFDMetricOptions}
        rules={{
          validate: (value, formState) => {
            return formState.rhsColumnType == 'Numeric' && value != 'EUCLIDEAN'
              ? 'Must be Euclidean if column type is numeric'
              : formState.rhsColumnType != 'Numeric' && value == 'EUCLIDEAN'
                ? "Can't be Euclidean if column type is not numeric"
                : undefined;
          },
        }}
      />
      <ControlledSelect
        label="Algorithm"
        controlName="metricAlgorithm"
        control={methods.control}
        options={MFDAlgoOptions}
        rules={{
          validate: (value, formState) => {
            if (Array.isArray(formState.rhsIndices))
              return value == 'CALIPERS' &&
                (formState.rhsColumnType != 'Numeric' ||
                  formState.rhsIndices.length !== 2)
                ? 'Count of RHS Columns must be 2'
                : undefined;
            return undefined;
          },
        }}
      />
      <ControlledNumberInput
        label="Tolerance parameter"
        controlName="parameter"
        control={methods.control}
        numberProps={{
          defaultNum: 1.0,
          min: 0,
        }}
      />
      <ControlledNumberInput
        label="Q-gram length"
        controlName="q"
        control={methods.control}
        disabled={qDisabled}
        numberProps={{
          defaultNum: 1.0,
          min: 1,
          includingMin: true,
          numbersAfterDot: 0,
        }}
      />
      <ControlledSelect
        label="Distance to null"
        controlName="distanceToNullIsInfinity"
        control={methods.control}
        options={MFDDistancesOptions}
      />
    </>
  );
};

MFDForm.onSubmit = (fieldValues) =>
  _.omit(
    {
      ...fieldValues,
      algorithmName: 'MetricVerification',
    },
    ['rhsColumnType'],
  );

export default MFDForm;
