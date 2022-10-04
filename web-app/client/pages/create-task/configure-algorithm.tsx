import type { NextPage } from 'next';
import React, { FC, useCallback, useContext, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import _ from 'lodash';
import Button from '@components/Button';
import ideaIcon from '@assets/icons/idea.svg';
import { WizardLayout } from '@components/WizardLayout/WizardLayout';
import NumberSlider from '@components/Inputs/NumberSlider/NumberSlider';
import { Select } from '@components/Inputs';
import styles from '@styles/ConfigureAlgorithm.module.scss';
import { MainPrimitiveType } from 'types/globalTypes';
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  useForm,
  UseFormStateReturn,
} from 'react-hook-form';
import {
  Algorithms,
  ApproxOptions,
  ARoptions,
  CFDoptions,
  FDoptions,
  optionsByAlgorithms,
  TypoOptions,
} from '@constants/options';
import { useMutation } from '@apollo/client';
import {
  createTaskWithDatasetChoosing,
  createTaskWithDatasetChoosingVariables,
} from '@graphql/operations/mutations/__generated__/createTaskWithDatasetChoosing';
import { CREATE_TASK_WITH_CHOOSING_DATASET } from '@graphql/operations/mutations/chooseTask';
import { ErrorContext } from '@components/ErrorContext';
import { useErrorContext } from '@hooks/useErrorContext';

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
type AlgorithmConfig = FDForm | CFDForm | ARForm | TypoFDForm;
type AlgorithmProps = FDForm & CFDForm & ARForm & TypoFDForm;
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
    maxLHS: 1,
    errorThreshold: 1,
    // minConfidence: 1,
    threadsCount: 1,
    defaultRadius: 1,
    defaultRatio: 0,
    metric: 'MODULUS_OF_DIFFERENCE',
  } as TypoFDForm,
};
type QueryProps = {
  primitive: MainPrimitiveType;
  fileID: string;
  formParams: { [key: string]: string | string[] | undefined };
};
const ConfigureAlgorithm: NextPage = () => {
  const router = useRouter();
  const {
    primitive: rawPrimitive,
    fileID: rawFileID,
    ...formParams
  } = router.query;
  const primitive =
    typeof rawPrimitive === 'string' && rawPrimitive in MainPrimitiveType
      ? (rawPrimitive as MainPrimitiveType)
      : undefined;
  const fileID = typeof rawFileID === 'string' ? rawFileID : undefined;
  return (
    <>
      {primitive && fileID && (
        <BaseConfigureAlgorithm
          primitive={primitive}
          fileID={fileID}
          formParams={formParams}
        />
      )}
      {!primitive && <p>Error: primitive not specified</p>}
    </>
  );
};
const BaseConfigureAlgorithm: FC<QueryProps> = ({
  primitive,
  fileID,
  formParams,
}) => {
  const router = useRouter();
  const { showError } = useErrorContext();
  const {
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<AlgorithmConfig, keyof AlgorithmProps>({
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

  const [createTask] = useMutation<
    createTaskWithDatasetChoosing,
    createTaskWithDatasetChoosingVariables
  >(CREATE_TASK_WITH_CHOOSING_DATASET);
  const analyzeHandler = useCallback(
    handleSubmit((data) => {
      createTask({
        variables: {
          fileID: fileID,
          props: {
            type: primitive,
            ...data,
          },
          forceCreate: false,
        },
      })
        .then((resp) => {
          router.push({
            pathname: '/reports',
            query: {
              taskID: resp.data?.createMainTaskWithDatasetChoosing.taskID,
            },
          });
        })
        .catch(() => {
          showError({ message: 'Internal error ocurred. Please try later.' });
        });
    }),
    [primitive]
  );

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
      <Button variant="primary" icon={ideaIcon} onClick={analyzeHandler}>
        Analyze
      </Button>
    </>
  );

  const Inputs: Record<
    MainPrimitiveType,
    Partial<Record<keyof AlgorithmProps, FormInput>>
  > = useMemo(
    () => ({
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
            disabled={
              !optionsByAlgorithms[watchAlgorithm as Algorithms].includes(
                'threshold'
              )
            }
            sliderProps={{ min: 0, max: 1, step: 1e-6 }}
            label="Error threshold"
          />
        ),
        maxLHS: ({ field }) => (
          <NumberSlider
            {...field}
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
            sliderProps={{ min: 0, max: 1, step: 1e-6 }}
            label="Minimum confidence"
          />
        ),
        maxLHS: ({ field }) => (
          <NumberSlider
            {...field}
            sliderProps={{ min: 1, max: 10, step: 1 }}
            label="Arity constraint"
          />
        ),
        minSupportCFD: ({ field }) => (
          <NumberSlider
            {...field}
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
            sliderProps={{ min: 0, max: 1, step: 1e-6 }}
            label="Minimum confidence"
          />
        ),
        minSupportAR: ({ field }) => (
          <NumberSlider
            {...field}
            sliderProps={{ min: 0, max: 1, step: 1e-6 }}
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
            sliderProps={{ min: 0, max: 1, step: 1e-6 }}
            label="Error threshold"
          />
        ),
        maxLHS: ({ field }) => (
          <NumberSlider
            {...field}
            sliderProps={{ min: 1, max: 9, step: 1 }}
            label="Arity constraint"
          />
        ),
        threadsCount: ({ field }) => (
          <NumberSlider
            {...field}
            sliderProps={{ min: 1, max: 8, step: 1 }}
            label="Thread count"
          />
        ),
        defaultRadius: ({ field }) => (
          <NumberSlider
            {...field}
            sliderProps={{ min: 1, max: 10, step: 1e-6 }}
            label="Radius"
          />
        ),
        defaultRatio: ({ field }) => (
          <NumberSlider
            {...field}
            sliderProps={{ min: 0, max: 1, step: 0.01 }}
            label="Ratio"
          />
        ),
      },
    }),
    [watchAlgorithm]
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
