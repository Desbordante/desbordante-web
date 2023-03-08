import { cursorTo } from 'readline';
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
  FormProvider,
  UseFormStateReturn,
} from 'react-hook-form';
import IdeaIcon from '@assets/icons/idea.svg?component';
import Button from '@components/Button';
import { Select } from '@components/Inputs';
import { MultiSelect } from '@components/Inputs';
import badgeStyles from '@components/Inputs/MultiSelect/OptionBadge/OptionBadge.module.scss';
import NumberInput from '@components/Inputs/NumberInput';
import NumberSlider from '@components/Inputs/NumberSlider';
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
import {
  getCountOfColumns,
  getCountOfColumnsVariables,
} from '@graphql/operations/queries/__generated__/getCountOfColumns';
import { GET_COUNT_OF_COLUMNS } from '@graphql/operations/queries/getDatasetColumnCount';
import { useErrorContext } from '@hooks/useErrorContext'; // to delete?
import { useTaskUrlParams } from '@hooks/useTaskUrlParams';
import styles from '@styles/ConfigureAlgorithm.module.scss';
import { showError } from '@utils/toasts';
import { form, fignya, dependencies, formDefaultValues } from 'testFormUserr';
import { MainPrimitiveType } from 'types/globalTypes';

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

  const methods = useForm({ defaultValues: formDefaultValues });
  const onSubmit = methods.handleSubmit((data) => {
    console.log(data);
  });
  const [formState, setFormState] = useState(form);
  useEffect(() => {
    setFormState((formSnapshot) => fignya(formSnapshot, methods));
  }, methods.watch(dependencies));

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit}>
        {Object.entries(formState)
          .sort((A, B) => B[1].order - A[1].order)
          .map(([name, field]) => null)}
      </form>
    </FormProvider>
  );
};

export default ConfigureAlgorithm;
