import type { NextPage } from 'next';
import { FC, useContext, useState } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '@components/AuthContext';
import { ErrorContext } from '@components/ErrorContext';
import _ from 'lodash';
import Button from '@components/Button';
import ideaIcon from '@assets/icons/idea.svg';
import { WizardLayout } from '@components/WizardLayout/WizardLayout';
import NumberSlider from '@components/Inputs/NumberSlider/NumberSlider';
import { Select } from '@components/Inputs';
import styles from '@styles/ConfigureAlgorithm.module.scss';
import { useQuery } from '@apollo/client';
import { getAlgorithmsConfig } from '@graphql/operations/queries/__generated__/getAlgorithmsConfig';
import { GET_ALGORITHMS_CONFIG } from '@graphql/operations/queries/getAlgorithmsConfig';
import { MainPrimitiveType } from 'types/globalTypes';
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  useForm,
  UseFormStateReturn,
} from 'react-hook-form';
import {
  ApproxOptions,
  ARoptions,
  CFDoptions,
  FDoptions,
  TypoOptions,
} from '@constants/options';

type Algorithms =
  | 'Pyro'
  | 'TaneX'
  | 'FastFDs'
  | 'FD mine'
  | 'DFD'
  | 'Dep Miner'
  | 'FDep'
  | 'FUN'
  | 'CTane'
  | 'Apriori';

type FDForm = {
  algorithm: { value: Algorithms };
  arity: any;
  threshold: any;
  threads: any;
};
type CFDForm = {
  algorithm: { value: 'CTane' };
  arity: any;
  min_confidence: any;
  min_support: any;
};
type ARForm = {
  algorithm: { value: 'Apriori' };
  min_confidence: any;
  min_support: any;
};
type TypoFDForm = {
  precise_algorithm?: { value: Algorithms };
  approximate_algorithm?: { value: Algorithms };
  arity: any;
  threshold: any;
  min_confidence: any;
  min_support: any;
  threads: any;
  radius: any;
  ratio: any;
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
    control,
    watch,
    formState: { errors },
  } = useForm<AlgorithmConfig, keyof AlgorithmProps>({});

  const router = useRouter();
  const fileID = router.query.fileID;
  const primitive = router.query.primitive as MainPrimitiveType;

  const { user } = useContext(AuthContext)!;
  const { showError } = useContext(ErrorContext)!;

  const showOptions: { [key in Algorithms]: string[] } = {
    Pyro: ['threshold', 'arity', 'threads'],
    TaneX: ['threshold', 'arity'],
    FastFDs: ['threads'],
    'FD mine': [],
    DFD: ['threads'],
    'Dep Miner': [],
    FDep: [],
    FUN: [],
    CTane: [],
    Apriori: [],
  };
  const watchAlgorithm = watch('algorithm')?.value || 'Pyro';
  const { loading, data, error } = useQuery<getAlgorithmsConfig>(
    GET_ALGORITHMS_CONFIG
  );

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
        // onClick={handleSubmit(data => 0)}
      >
        Analyze
      </Button>
    </>
  );

  const Inputs: {
    [key in MainPrimitiveType]: {
      [key in keyof AlgorithmProps]?: FormInput;
    };
  } = {
    [MainPrimitiveType.FD]: {
      algorithm: ({ field }) => (
        <Select {...field} label="Algorithm" options={FDoptions} />
      ),
      threshold: ({ field }) => (
        <NumberSlider
          {...field}
          disabled={!showOptions[watchAlgorithm].includes('threshold')}
          sliderProps={{ min: 0, max: 1, step: 1e-6 }}
          label="Error threshold"
        />
      ),
      arity: ({ field }) => (
        <NumberSlider
          {...field}
          disabled={!showOptions[watchAlgorithm].includes('arity')}
          sliderProps={{ min: 1, max: 10, step: 1 }}
          label="Arity constraint"
        />
      ),
      threads: ({ field }) => (
        <NumberSlider
          {...field}
          disabled={!showOptions[watchAlgorithm].includes('threads')}
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
