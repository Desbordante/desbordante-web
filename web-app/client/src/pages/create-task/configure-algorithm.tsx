import { useMutation, useQuery } from '@apollo/client';
import _ from 'lodash';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  useForm,
  UseFormStateReturn,
} from 'react-hook-form';
import IdeaIcon from '@assets/icons/idea.svg?component';
import Button from '@components/Button';
import { Select } from '@components/Inputs';
import { MultiSelect } from '@components/Inputs';
import NumberSlider from '@components/Inputs/NumberSlider';
import NumberInput from '@components/Inputs/NumberInput';
import WizardLayout from '@components/WizardLayout';
import {
  Algorithms,
  ApproxOptions,
  ARoptions,
  CFDoptions,
  FDoptions,
  optionsByAlgorithms,
  TypoOptions,
  MFDColumnType,
  MFDMetric,
  MFDAlgoOptions,
  MFDMetricOptions,
  MFDColumnTypeOptions,
  MFDDistancesOptions,
  optionsByMetrics,
  optionsByColumnTypes,
} from '@constants/options';
import {
  createTaskWithDatasetChoosing,
  createTaskWithDatasetChoosingVariables,
} from '@graphql/operations/mutations/__generated__/createTaskWithDatasetChoosing';
import { CREATE_TASK_WITH_CHOOSING_DATASET } from '@graphql/operations/mutations/chooseTask';
import { useTaskUrlParams } from '@hooks/useTaskUrlParams';
import {
  getCountOfColumns,
  getCountOfColumnsVariables,
} from '@graphql/operations/queries/__generated__/getCountOfColumns'
import { GET_COUNT_OF_COLUMNS } from '@graphql/operations/queries/getDatasetColumnCount';

import { useErrorContext } from '@hooks/useErrorContext'; // to delete?
import styles from '@styles/ConfigureAlgorithm.module.scss';
import { showError } from '@utils/toasts';
import { MainPrimitiveType } from 'types/globalTypes';
import { cursorTo } from 'readline';
import badgeStyles from '@components/Inputs/MultiSelect/OptionBadge/OptionBadge.module.scss';

type FDForm = {
  algorithmName: any;
  maxLHS: number;
  errorThreshold: number;
  threadsCount: number;
};

type CFDForm = {
  algorithmName: any;
  maxLHS: number;
  minConfidence: number;
  minSupportCFD: number;
};

type ARForm = {
  algorithmName: any;
  minConfidence: number;
  minSupportAR: number;
};

type TypoFDForm = {
  preciseAlgorithm?: any;
  approximateAlgorithm?: any;
  algorithmName: any;
  maxLHS: number;
  errorThreshold: number;
  // minConfidence: number;
  // minSupport: number;
  threadsCount: number;
  defaultRadius: number;
  defaultRatio: number;
  metric: any;
};
type MFDForm = {
  algorithmName: "MetricVerification"; // constant
  lhsIndices: number[];
  rhsIndices: number[];
  rhsColumnType: any; // client-side
  metric: any;
  metricAlgorithm: any;
  parameter: number; //toleranceParameter
  q: number; // qgramLength
  distanceToNullIsInfinity: any;
}
type AlgorithmConfig = FDForm | CFDForm | ARForm | TypoFDForm | MFDForm;
type AlgorithmProps = FDForm & CFDForm & ARForm & TypoFDForm & MFDForm;
type FormInput = (props: {
  field: ControllerRenderProps<AlgorithmConfig, keyof AlgorithmProps>;
  fieldState: ControllerFieldState;
  formState: UseFormStateReturn<AlgorithmConfig>;
}) => React.ReactElement;

const defaultValuesByPrimitive = {
  [MainPrimitiveType.FD]: {
    algorithmName: 'Pyro',
    maxLHS: 1,
    errorThreshold: 1,
    threadsCount: 1,
  } as FDForm,
  [MainPrimitiveType.AR]: {
    algorithmName: 'Apriori',
    minConfidence: 0,
    minSupportAR: 0,
  } as ARForm,
  [MainPrimitiveType.CFD]: {
    algorithmName: 'CTane',
    maxLHS: 1,
    minConfidence: 0,
    minSupportCFD: 1,
  } as CFDForm,
  [MainPrimitiveType.TypoFD]: {
    preciseAlgorithm: 'FastFDs',
    approximateAlgorithm: 'Pyro',
    algorithmName: 'Typo Miner',
    maxLHS: 5,
    errorThreshold: 0.1,
    // minConfidence: 1,
    threadsCount: 2,
    defaultRadius: 3,
    defaultRatio: 1,
    metric: 'MODULUS_OF_DIFFERENCE',
  } as TypoFDForm,
  [MainPrimitiveType.MFD]: {
    algorithmName: "MetricVerification", // constant
    lhsIndices: [],
    rhsIndices: [],
    rhsColumnType: 'Numeric', // client-side
    metric: 'EUCLIDEAN',
    metricAlgorithm: 'BRUTE',
    parameter: 1.0, //toleranceParameter
    q: 1, // qgramLength
    distanceToNullIsInfinity: true,
  } as MFDForm,
  [MainPrimitiveType.Stats]: {}, // Pechenux to reviewers: temporary solution
};

type QueryProps = {
  primitive: MainPrimitiveType;
  fileID: string;
  formParams: { [key: string]: string | string[] | undefined };
};

const ConfigureAlgorithm: NextPage = () => {
  const router = useRouter();
  const { primitive, fileID, config } = useTaskUrlParams();

  if (router.isReady && !primitive.value) {
    router.push({
      pathname: '/create-task/choose-primitive',
      query: router.query,
    });
  }

  if (router.isReady && !fileID.value) {
    router.push({
      pathname: '/create-task/choose-file',
      query: router.query,
    });
  }

  return (
    <>
      {primitive.value && fileID.value && (
        <BaseConfigureAlgorithm
          primitive={primitive.value}
          fileID={fileID.value}
          formParams={config.value}
        />
      )}
    </>
  );
};

const BaseConfigureAlgorithm: FC<QueryProps> = ({
  primitive,
  fileID,
  formParams,
}) => {
  const router = useRouter();
  const { handleSubmit, reset, control, watch, setValue } = useForm<
    AlgorithmConfig,
    keyof AlgorithmProps
  >({
    defaultValues: {
      algorithmName: 'Pyro',
      preciseAlgorithm: 'Pyro',
      approximateAlgorithm: 'Pyro',
    },
  });
  const getSelectValue: (opt: any) => string = (opt) => opt?.value;
  const getSelectOption: (value: string) => Record<string, string> = (
    value
  ) => ({ label: value, value });

  const getSelectValues: (opt: ReadonlyArray<any>) => number[] = (opt) => {
    return opt.map(element => element.value);
  };
  const getSelectOptions: (options: ReadonlyArray<any>, values: ReadonlyArray<number>) => ReadonlyArray<any> = (
    options, values
  ) => {
    return values !== undefined ? options.filter((element) => { return values.includes(element.value) }) : [];
  };

  function omit(obj: any, ...props: any) {
    const result = { ...obj };
    props.forEach(function (prop: any) {
      delete result[prop];
    });
    return result;
  }

  const [createTask] = useMutation<
    createTaskWithDatasetChoosing,
    createTaskWithDatasetChoosingVariables
  >(CREATE_TASK_WITH_CHOOSING_DATASET);
  const analyzeHandler = useCallback(
    handleSubmit((data) => {
      data = omit(data, 'rhsColumnType');
      createTask({
        variables: {
          fileID: fileID,
          props: {
            type: primitive,
            ...data,
          },
          forceCreate: true,
        },
      })
        .then((resp) =>
          router.push({
            pathname: '/reports',
            query: {
              taskID: resp.data?.createMainTaskWithDatasetChoosing.taskID,
            },
          })
        )
        .catch((error) => {
          if (error instanceof Error) {
            showError(
              error.message,
              'Internal error occurred. Please try later.'
            );
          }
        });
    }),
    [primitive]
  );

  const { loading, error, data } = useQuery<
    getCountOfColumns,
    getCountOfColumnsVariables
    >(GET_COUNT_OF_COLUMNS, {
      variables: { fileID: fileID },
      skip: (primitive !== MainPrimitiveType.MFD),
      onError: (error) => {
        showError(
          error.message,
          'Can\'t fetch columns information. Please try later.'
        );
      }
    });

  const columnData = useMemo(() => {
    if (data) {
      const countOfColumns: number = data?.datasetInfo?.countOfColumns || 0;
      const statistics: any[] = data?.datasetInfo?.statsInfo.stats || [];
      const hasHeader: boolean = data?.datasetInfo?.hasHeader || false;
      const headers: string[] = data?.datasetInfo?.header || [];

      return [...Array(countOfColumns)].map((_, i) => (
        {
          label: hasHeader ? `${i + 1}: ${headers[i]}` : `Column ${i + 1}`,
          value: i,
          badges: statistics.filter(elem => elem.column.index == i).map(
            (elem => ({ label: elem.type, style: badgeStyles.primary }))
          )
          // filtering for columns with equal indices
          // get type from each and create badge
        }
      ));
    }
    return [];
  }, [loading, error, data]);

  useEffect(() => {
    const defaultValues = defaultValuesByPrimitive[primitive];

    if (formParams?.algorithmName) {
      // to not populate form with empty values
      reset({
        ...defaultValues,
        ..._.pick(formParams, _.keys(defaultValues)),
      });
    } else {
      reset(defaultValues);
    }
  }, [formParams]);

  const watchAlgorithm = watch('algorithmName', 'Pyro') || 'Pyro';
  const watchColumnType = watch('rhsColumnType', 'Numeric') || 'Numeric';
  const watchMetric = watch('metric', 'EUCLIDEAN') || 'EUCLIDEAN';
  const watchRHS = watch('rhsIndices', []) || [];

  const TypesCategories: Record<string, string> = {
    "Int": "Numeric",
    "Double": "Numeric",
    "BigInt": "Numeric",
    "String": "String"
  }

  const [columnType, setColumnType] = useState("manual");

  useEffect(() => { // logic for mfd rhs type
    if (columnData.some(elem => elem.badges.length == 0)) { // noTypesFlag
      setColumnType("manual");
      return;
    }

    const types = Array.from(new Set<string>(watchRHS.map(elem => TypesCategories[columnData[elem].badges[0].label] || "Undefined")));

    if (types.length === 0) { // allow user to change type
      setColumnType("manual");
    } else if (types.length === 1) { // set type for user
      if (["Numeric", "String"].includes(types[0])) {
        setColumnType("auto");
        setValue("rhsColumnType", types[0])
      } else {// show error
        setColumnType("error");
      }
    } else { // show error
      setColumnType("error");
    }
  }, [watchRHS])

  const header = (
    <>
      <h2 className={styles.name_main}>Configure Algorithm</h2>
      <h6 className={styles.description}>
        Vitae ipsum leo ut tincidunt viverra nec cum.
      </h6>
    </>
  );

  const footer = (
    <>
      <Button
        variant="secondary"
        onClick={() =>
          router.push({
            pathname: '/create-task/choose-file',
            query: router.query,
          })
        }
      >
        Go Back
      </Button>
      <Button variant="primary" icon={<IdeaIcon />} onClick={analyzeHandler}>
        Analyze
      </Button>
    </>
  );

  const Inputs: Record<
    MainPrimitiveType,
    Partial<Record<keyof AlgorithmProps, FormInput>>
  > = useMemo(
    () => ({
      [MainPrimitiveType.Stats]: {}, // to delete
      [MainPrimitiveType.FD]: {
        algorithmName: ({ field: { onChange, value, ...field } }) => (
          <Select
            {...field}
            value={getSelectOption(value)}
            onChange={(e) => onChange(getSelectValue(e))}
            label="Algorithm"
            options={FDoptions}
          />
        ),
        errorThreshold: ({ field }) => (
          <NumberSlider
            {...field}
            size={4}
            disabled={
              !optionsByAlgorithms[watchAlgorithm as Algorithms].includes(
                'threshold'
              )
            }
            sliderProps={{ min: 0, max: 1, step: 1e-4 }}
            label="Error threshold"
          />
        ),
        maxLHS: ({ field }) => (
          <NumberSlider
            {...field}
            size={4}
            disabled={
              !optionsByAlgorithms[watchAlgorithm as Algorithms].includes(
                'arity'
              )
            }
            sliderProps={{ min: 1, max: 10, step: 1 }}
            label="Arity constraint"
          />
        ),
        threadsCount: ({ field }) => (
          <NumberSlider
            {...field}
            size={4}
            disabled={
              !optionsByAlgorithms[watchAlgorithm as Algorithms].includes(
                'threads'
              )
            }
            sliderProps={{ min: 1, max: 8, step: 1 }}
            label="Thread count"
          />
        ),
      },
      [MainPrimitiveType.CFD]: {
        algorithmName: ({ field: { onChange, value, ...field } }) => (
          <Select
            {...field}
            value={getSelectOption(value)}
            onChange={(e) => onChange(getSelectValue(e))}
            label="Algorithm"
            options={CFDoptions}
          />
        ),
        minConfidence: ({ field }) => (
          <NumberSlider
            {...field}
            size={4}
            sliderProps={{ min: 0, max: 1, step: 1e-4 }}
            label="Minimum confidence"
          />
        ),
        maxLHS: ({ field }) => (
          <NumberSlider
            {...field}
            size={4}
            sliderProps={{ min: 1, max: 10, step: 1 }}
            label="Arity constraint"
          />
        ),
        minSupportCFD: ({ field }) => (
          <NumberSlider
            {...field}
            size={4}
            sliderProps={{ min: 1, max: 16, step: 1 }}
            label="Minimum support"
          />
        ),
      },
      [MainPrimitiveType.AR]: {
        algorithmName: ({ field: { onChange, value, ...field } }) => (
          <Select
            {...field}
            value={getSelectOption(value)}
            onChange={(e) => onChange(getSelectValue(e))}
            label="Algorithm"
            options={ARoptions}
          />
        ),
        minConfidence: ({ field }) => (
          <NumberSlider
            {...field}
            size={5}
            sliderProps={{ min: 0, max: 1, step: 1e-4 }}
            label="Minimum confidence"
          />
        ),
        minSupportAR: ({ field }) => (
          <NumberSlider
            {...field}
            size={5}
            sliderProps={{ min: 0, max: 1, step: 1e-4 }}
            label="Minimum support"
          />
        ),
      },
      [MainPrimitiveType.TypoFD]: {
        preciseAlgorithm: ({ field: { onChange, value, ...field } }) => (
          <Select
            {...field}
            value={getSelectOption(value)}
            onChange={(e) => onChange(getSelectValue(e))}
            label="Precise Algorithm"
            options={TypoOptions}
          />
        ),
        approximateAlgorithm: ({ field: { onChange, value, ...field } }) => (
          <Select
            {...field}
            value={getSelectOption(value)}
            onChange={(e) => onChange(getSelectValue(e))}
            label="Approximate Algorithm"
            options={ApproxOptions}
          />
        ),
        errorThreshold: ({ field }) => (
          <NumberSlider
            {...field}
            size={4}
            sliderProps={{ min: 0, max: 1, step: 1e-4 }}
            label="Error threshold"
          />
        ),
        maxLHS: ({ field }) => (
          <NumberSlider
            {...field}
            size={4}
            sliderProps={{ min: 1, max: 9, step: 1 }}
            label="Arity constraint"
          />
        ),
        threadsCount: ({ field }) => (
          <NumberSlider
            {...field}
            size={4}
            sliderProps={{ min: 1, max: 8, step: 1 }}
            label="Thread count"
          />
        ),
        defaultRadius: ({ field }) => (
          <NumberSlider
            {...field}
            size={4}
            sliderProps={{ min: 1, max: 10, step: 1e-4 }}
            label="Radius"
          />
        ),
        defaultRatio: ({ field }) => (
          <NumberSlider
            {...field}
            size={4}
            sliderProps={{ min: 0, max: 1, step: 1e-2 }}
            label="Ratio"
          />
        ),
      },
      [MainPrimitiveType.MFD]: {
        // TODO: add hidden field
        lhsIndices: ({ field: { onChange, value, ...field } }) => (
          <MultiSelect
            {...field}
            isLoading={loading}
            value={getSelectOptions(columnData, value)}
            onChange={(newValue, _) => onChange(getSelectValues(newValue as { label: string, value: number }[]))}
            label="LHS Columns"
            options={columnData}
          />
        ),
        rhsIndices: ({ field: { onChange, value, ...field } }) => (
          <MultiSelect
            {...field}
            error={
              columnType === "error" ?
                "Choose different columns"
                :
                watchColumnType as MFDColumnType === "String" && value.length > 1 ?
                  "Must contain only one column of type \"String\""
                  :
                  undefined
            }
            isLoading={loading}
            value={getSelectOptions(columnData, value)}
            onChange={(newValue, _) => onChange(getSelectValues(newValue as { label: string, value: number }[]))}
            label="RHS Columns"
            options={columnData}
          />
        ),
        rhsColumnType: ({ field: { onChange, value, ...field } }) => (
          <Select
            {...field}
            isDisabled={columnType === "auto"}
            value={MFDColumnTypeOptions.find(option => option.value === value)}
            onChange={(e) => onChange(getSelectValue(e))}
            label="RHS column type"
            options={MFDColumnTypeOptions}
          />
        ),
        metric: ({ field: { onChange, value, ...field } }) => (
          <Select
            {...field}
            error={
              watchColumnType as MFDColumnType == "Numeric" && value != "EUCLIDEAN" ?
                "Must be Euclidean if column type is numeric"
                :
                watchColumnType as MFDColumnType != "Numeric" && value == "EUCLIDEAN" ?
                  "Can't be Euclidean if column type is not numeric"
                  :
                  undefined
            }
            value={MFDMetricOptions.find(option => option.value === value)}
            onChange={(e) => onChange(getSelectValue(e))}
            label="Metric"
            options={MFDMetricOptions}
          />
        ),
        metricAlgorithm: ({ field: { onChange, value, ...field } }) => (
          <Select
            {...field}
            isDisabled={watchColumnType as MFDColumnType == "Numeric" && watchRHS.length == 1}
            error={
              watchRHS.length != 2 &&
                value == "CALIPERS" &&
                !(watchColumnType as MFDColumnType == "Numeric" && watchRHS.length == 1) ?
                "Count of RHS Columns must be 2"
                :
                undefined
            }
            value={MFDAlgoOptions.find(option => option.value === value)}
            onChange={(e) => onChange(getSelectValue(e))}
            label="Algorithm"
            options={MFDAlgoOptions}
          />
        ),
        parameter: ({ field }) => (
          <NumberInput
            {...field}
            numberProps={{ defaultNum: 1.0, min: 0}}
            label="Tolerance parameter"
          />
        ),
        q: ({ field }) => (
          <NumberInput
            {...field}
            disabled={
              !optionsByMetrics[watchMetric as MFDMetric].includes(
                'qgram'
              )
            }
            numberProps={{ defaultNum: 1, min: 1, includingMin: true, nunbersAfterDot: 0 }}
            label="Q-gram length"
          />
        ),
        distanceToNullIsInfinity: ({ field: { onChange, value, ...field } }) => (
          <Select
            {...field}
            value={MFDDistancesOptions.find(option => option.value === value)}
            onChange={(e) => onChange(getSelectValue(e))}
            label="Distance to null"
            options={MFDDistancesOptions}
          />
        ),
      },
    }),
    [watchAlgorithm, watchColumnType, watchMetric, watchRHS, columnData, loading, columnType]
  );

  const InputsForm = _.map(
    Inputs[primitive],
    (Component: FormInput, name: keyof AlgorithmProps) =>
      Component && (
        <Controller
          key={name}
          name={name}
          control={control}
          render={Component}
        />
      )
  );

  return (
    <WizardLayout header={header} footer={footer}>
      <div className={styles.container}>{InputsForm}</div>
    </WizardLayout>
  );
};

export default ConfigureAlgorithm;
