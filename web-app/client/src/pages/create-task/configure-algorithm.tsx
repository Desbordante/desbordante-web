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
import { test_form } from '@pages/create-task/configurator-forms/test2FormUser';
import styles from '@styles/ConfigureAlgorithm.module.scss';
import { showError } from '@utils/toasts';
import { MainPrimitiveType } from 'types/globalTypes';

const primitives = {
  [MainPrimitiveType.FD]: test_form,
  [MainPrimitiveType.FD]: test_form,
  [MainPrimitiveType.AR]: test_form,
  [MainPrimitiveType.CFD]: test_form,
  [MainPrimitiveType.TypoFD]: test_form,
  [MainPrimitiveType.MFD]: test_form,
  [MainPrimitiveType.Stats]: test_form,
};

const ConfigureAlgorithm: NextPage = () => {
  const router = useRouter();
  const { primitive, fileID, config } = useTaskUrlParams();

  if (router.isReady && !primitive.value) {
    router
      .push({
        pathname: '/create-task/choose-primitive',
        query: router.query,
      })
      .then();
  }

  if (router.isReady && !fileID.value) {
    router
      .push({
        pathname: '/create-task/choose-file',
        query: router.query,
      })
      .then();
  }

  return (
    <>
      {primitive.value && fileID.value && (
        <FormComponent
          primitive={primitive.value}
          fileID={fileID.value}
          formParams={config.value}
        />
      )}
    </>
  );
};

type QueryProps = {
  primitive: MainPrimitiveType;
  fileID: string;
  formParams: { [key: string]: string | string[] | undefined };
};

const FormComponent: FC<QueryProps> = ({ primitive, fileID, formParams }) => {
  const router = useRouter();

  const formObject = primitives[primitive];

  const formDefaultValues = formObject.formDefaults;
  const formFields = formObject.formFields;

  const formProcessor = formObject.formProcessor;
  const formLogic = formProcessor.formLogic;
  const formLogicDeps = formProcessor.deps;

  const methods = useForm({ defaultValues: formDefaultValues });
  const onSubmit = methods.handleSubmit((data) => {
    console.log(data);
  });

  const [formState, setFormState] = useState(formFields);

  formObject.useFormHook(fileID, formState, methods);

  useEffect(() => {
    setFormState((formSnapshot) => formLogic(formSnapshot, methods));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formLogic, methods, ...methods.watch(formLogicDeps)]);

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
      <Button variant="primary" icon={<IdeaIcon />} onClick={onSubmit}>
        Analyze
      </Button>
    </>
  );

  return (
    <WizardLayout header={header} footer={footer}>
      <FormProvider {...methods}>
        <form onSubmit={onSubmit}>
          {Object.entries(formState) // TODO: move to useMemo
            .sort((A, B) => A[1].order - B[1].order)
            .map(([name, field]) => (
              <div key={field.order}>
                <div>{name}</div>
                <div>{JSON.stringify(field)}</div>
                <br />
              </div>
            ))}
        </form>
      </FormProvider>
    </WizardLayout>
  );
};

export default ConfigureAlgorithm;
