import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import IdeaIcon from '@assets/icons/idea.svg?component';
import Button from '@components/Button';
import {
  FormCheckbox,
  FormMultiSelect,
  FormNumberInput,
  FormNumberSlider,
  FormRadio,
  FormSelect,
  FormText,
} from '@components/FormInputs';
import WizardLayout from '@components/WizardLayout';
import { useTaskUrlParams } from '@hooks/useTaskUrlParams';
import { test_form } from '@pages/create-task/configurator-forms/test2FormUser';
import styles from '@styles/ConfigureAlgorithm.module.scss';
import { FormInputElement } from 'types/form';
import { MainPrimitiveType } from 'types/globalTypes';

const primitives = {
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

  const formDefaultValues = { ...formObject.formDefaults, ...formParams };
  const formFields = formObject.formFields;

  const formProcessor = formObject.formProcessor;
  const formLogic = formProcessor.formLogic;
  const formLogicDeps = formProcessor.deps;

  const methods = useForm({ defaultValues: formDefaultValues });
  const onSubmit = methods.handleSubmit((data) => {
    console.log(data);
  });

  const [formState, setFormState] = useState(formFields);

  formObject.useFormHook(fileID, formState, setFormState, methods);

  const watchDeps = methods.watch(formLogicDeps);

  useEffect(() => {
    setFormState((formSnapshot) => formLogic(formSnapshot, methods));
  }, [formLogic, methods, watchDeps]);

  const inputs: Record<
    string,
    FormInputElement<typeof formDefaultValues>
  > = useMemo(
    () =>
      ({
        select: FormSelect,
        multi_select: FormMultiSelect,
        number_slider: FormNumberSlider,
        number_input: FormNumberInput,
        checkbox: FormCheckbox,
        radio: FormRadio,
        text: FormText,
      } as unknown as Record<
        string,
        FormInputElement<typeof formDefaultValues>
      >),
    []
  );

  const header = (
    <>
      <h2 className={styles.name_main}>Configure Algorithm</h2>
      <h6 className={styles.description}>Select algorithm parameters</h6>
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

  type Entries<T> = {
    [K in keyof T]: [K, T[K]];
  }[keyof T][];

  const entries = (
    Object.entries(formState).sort(
      (A, B) => A[1].order - B[1].order
    ) as Entries<typeof formState>
  ).map(([name, fieldProps]) => {
    const { rules } = { rules: undefined, ...fieldProps };

    return (
      <Controller<typeof formDefaultValues>
        key={name}
        name={name}
        control={methods.control}
        rules={rules}
        render={({ field }) => {
          if (fieldProps.type === 'custom')
            return (
              <div className={'Custom'} key={fieldProps.label}>
                {fieldProps.component({
                  key: fieldProps.label,
                  ...fieldProps,
                  ...methods.register(name),
                })}
              </div>
            );

          if (fieldProps.type in inputs) {
            const Component = inputs[fieldProps.type];
            return <Component field={field} props={fieldProps} />;
          }

          return (
            <div key={fieldProps.label}>
              <div>{name}</div>
              <div>{JSON.stringify(fieldProps)}</div>
              <br />
            </div>
          );
        }}
      />
    );
  });

  return (
    <WizardLayout header={header} footer={footer}>
      <div className={styles.container}>{...entries}</div>
    </WizardLayout>
  );
};

export default ConfigureAlgorithm;
