import type { NextPage } from 'next';
import { FC, useContext, useEffect, useState } from 'react';
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
  optionsByPrimitive,
  TypoOptions,
} from '@constants/options';

type FDForm = {
  algorithm: any;
  arity: number;
  threshold: number;
  threads: number;
};
type CFDForm = {
  algorithm: any;
  arity: number;
  min_confidence: number;
  min_support: number;
};
type ARForm = {
  algorithm: any;
  min_confidence: number;
  min_support: number;
};
type TypoFDForm = {
  precise_algorithm?: any;
  approximate_algorithm?: any;
  arity: number;
  threshold: number;
  min_confidence: number;
  min_support: number;
  threads: number;
  radius: number;
  ratio: number;
};
type AlgorithmConfig = FDForm | CFDForm | ARForm | TypoFDForm;
type AlgorithmProps = FDForm & CFDForm & ARForm & TypoFDForm;
type FormInput = (props: {
  field: ControllerRenderProps<AlgorithmConfig, keyof AlgorithmProps>;
  fieldState: ControllerFieldState;
  formState: UseFormStateReturn<AlgorithmConfig>;
}) => React.ReactElement;

const ConfigureAlgorithm: NextPage = () => {
  const {
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<AlgorithmConfig, keyof AlgorithmProps>();
  const router = useRouter();

  useEffect(
    () =>
      reset({
        ...router.query,
        algorithm:
          primitive &&
          optionsByPrimitive[primitive].find(
            (e) => e.value === (router.query.algorithm as string)
          ),
        approximate_algorithm: ApproxOptions.find(
          (e) => e.value === (router.query.approximate_algorithm as string)
        ),
        precise_algorithm: TypoOptions.find(
          (e) => e.value === (router.query.precise_algorithm as string)
        ),
      }),
    [router.query]
  );

  const primitive = router.query.primitive as MainPrimitiveType;

  const watchAlgorithm = watch('algorithm')?.value || 'Pyro';

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
      <Button
        variant="primary"
        icon={ideaIcon}
        onClick={handleSubmit((data) => console.log(3, data))}
      >
        Analyze
      </Button>
    </>
  );

  const Inputs: Record<
    MainPrimitiveType,
    Partial<Record<keyof AlgorithmProps, FormInput>>
  > = {
    [MainPrimitiveType.FD]: {
      algorithm: ({ field }) => (
        <Select {...field} label="Algorithm" options={FDoptions} />
      ),
      threshold: ({ field }) => (
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
      arity: ({ field }) => (
        <NumberSlider
          {...field}
          disabled={
            !optionsByAlgorithms[watchAlgorithm as Algorithms].includes('arity')
          }
          sliderProps={{ min: 1, max: 10, step: 1 }}
          label="Arity constraint"
        />
      ),
      threads: ({ field }) => (
        <NumberSlider
          {...field}
          disabled={
            !optionsByAlgorithms[watchAlgorithm as Algorithms].includes(
              'threads'
            )
          }
          sliderProps={{ min: 1, max: 16, step: 1 }}
          label="Thread count"
        />
      ),
    },

    [MainPrimitiveType.CFD]: {
      algorithm: ({ field }) => (
        <Select {...field} label="Algorithm" options={CFDoptions} />
      ),
      min_confidence: ({ field }) => (
        <NumberSlider
          {...field}
          sliderProps={{ min: 0, max: 1, step: 1e-6 }}
          label="Minimum confidence"
        />
      ),
      arity: ({ field }) => (
        <NumberSlider
          {...field}
          sliderProps={{ min: 1, max: 10, step: 1 }}
          label="Arity constraint"
        />
      ),
      min_support: ({ field }) => (
        <NumberSlider
          {...field}
          sliderProps={{ min: 1, max: 16, step: 1 }}
          label="Minimum support"
        />
      ),
    },

    [MainPrimitiveType.AR]: {
      algorithm: ({ field }) => (
        <Select {...field} label="Algorithm" options={ARoptions} />
      ),
      min_confidence: ({ field }) => (
        <NumberSlider
          {...field}
          sliderProps={{ min: 0, max: 1, step: 1e-6 }}
          label="Minimum confidence"
        />
      ),
      min_support: ({ field }) => (
        <NumberSlider
          {...field}
          sliderProps={{ min: 1, max: 16, step: 1 }}
          label="Minimum support"
        />
      ),
    },
    [MainPrimitiveType.TypoFD]: {
      precise_algorithm: ({ field }) => (
        <Select {...field} label="Precise Algorithm" options={TypoOptions} />
      ),
      approximate_algorithm: ({ field }) => (
        <Select
          {...field}
          label="Approximate Algorithm"
          options={ApproxOptions}
        />
      ),
      threshold: ({ field }) => (
        <NumberSlider
          {...field}
          sliderProps={{ min: 0, max: 1, step: 1e-6 }}
          label="Error threshold"
        />
      ),
      arity: ({ field }) => (
        <NumberSlider
          {...field}
          sliderProps={{ min: 1, max: 9, step: 1 }}
          label="Arity constraint"
        />
      ),
      threads: ({ field }) => (
        <NumberSlider
          {...field}
          sliderProps={{ min: 1, max: 16, step: 1 }}
          label="Thread count"
        />
      ),
      radius: ({ field }) => (
        <NumberSlider
          {...field}
          sliderProps={{ min: 1, max: 10, step: 1e-6 }}
          label="Radius"
        />
      ),
      ratio: ({ field }) => (
        <NumberSlider
          {...field}
          sliderProps={{ min: 0, max: 1, step: 0.01 }}
          label="Ratio"
        />
      ),
    },
  };

  const InputsForm = _.map(
    Inputs[primitive],
    (Component: FormInput, name: keyof AlgorithmProps) =>
      Component && (
        <Controller name={name} control={control} render={Component} />
      )
  );
  return (
    <WizardLayout header={header} footer={footer}>
      <div className={styles.container}>{InputsForm}</div>
    </WizardLayout>
  );
};

export default ConfigureAlgorithm;
