import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  useForm,
  UseFormStateReturn,
  useWatch,
} from 'react-hook-form';
import { UseControllerProps } from 'react-hook-form/dist/types/controller';
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
import { fd_form } from '@constants/configuratorForm/FDForm';
import { test_form } from '@constants/configuratorForm/test2FormUser';
import { useTaskUrlParams } from '@hooks/useTaskUrlParams';
import styles from '@styles/ConfigureAlgorithm.module.scss';
import {
  FormFieldsProps,
  FormHook,
  FormInputElement,
  FormProcessor,
} from 'types/form';
import { MainPrimitiveType } from 'types/globalTypes';

const primitives = {
  [MainPrimitiveType.FD]: fd_form,
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

type QueryProps<T extends MainPrimitiveType> = {
  primitive: T;
  fileID: string;
  formParams: { [key: string]: string | string[] | undefined };
};

const FormComponent = <T extends MainPrimitiveType>({
  primitive,
  fileID,
  formParams,
}: QueryProps<T>) => {
  const router = useRouter();

  const formObject = primitives[primitive];

  const formDefaultValues = useMemo(
    () => ({ ...formObject.formDefaults, ...formParams }),
    [formObject.formDefaults, formParams]
  );
  const formFields = formObject.formFields as FormFieldsProps<
    typeof formDefaultValues
  >;

  const useFormHook = formObject.useFormHook as FormHook<
    typeof formDefaultValues,
    typeof formFields
  >;
  const formProcessor = formObject.formProcessor as FormProcessor<
    typeof formDefaultValues,
    typeof formFields
  >;
  const formLogic = formProcessor.formLogic;
  const formLogicDeps = formProcessor.deps;

  const methods = useForm<
    typeof formDefaultValues,
    keyof typeof formDefaultValues
  >({ mode: 'onBlur', defaultValues: formDefaultValues });

  const onSubmit = methods.handleSubmit(
    (data) => {
      console.log('SENT', data);
    },
    (errors, event) => {
      console.log('ERROR', errors, event);
    }
  );

  console.log(
    '%cFORM COMPONENT RERENDER ===================================%s',
    'background: lightblue; color: black;'
  );

  // TODO: THIS IS HOW I CHECK IF USER MODIFIED FORM
  console.log('FORM IS CHANGED:', methods.formState.isDirty);

  console.log('FORM TOUCHED FIELDS:', methods.formState.touchedFields);

  console.log('FORM ERRORS:', methods.formState.errors);

  const [formState, setFormState] = useState(formFields);

  useFormHook(fileID, formState, setFormState, methods);

  const watchDeps = useWatch({ control: methods.control, name: formLogicDeps });

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
        checkbox: FormCheckbox, // not working, don't use
        radio: FormRadio, // not working, don't use
        text: FormText, // not working, don't use
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

  type FormInput = {
    name: keyof typeof formDefaultValues;
    rules?: UseControllerProps<typeof formDefaultValues>['rules'];
    render: (props: {
      field: ControllerRenderProps<typeof formDefaultValues>;
      fieldState: ControllerFieldState;
      formState: UseFormStateReturn<typeof formDefaultValues>;
    }) => React.ReactElement;
  };

  const formInputs: FormInput[] = useMemo(
    () =>
      (
        Object.entries(formState).sort(
          (A, B) => A[1].order - B[1].order
        ) as Entries<typeof formState>
      ).map(([name, fieldProps]) => {
        return {
          name,
          rules: 'rules' in fieldProps ? fieldProps.rules : undefined,
          render: ({ field }) => {
            if (fieldProps.type in inputs) {
              const Component = inputs[fieldProps.type];
              return <Component field={field} props={fieldProps} />;
            }

            if (fieldProps.type === 'custom')
              return (
                <div className={'Custom'} key={fieldProps.label}>
                  {fieldProps.component({
                    key: fieldProps.label,
                    ...fieldProps,
                    ...field,
                  })}
                </div>
              );

            return (
              <div key={fieldProps.label}>
                <div>{name}</div>
                <div>{JSON.stringify(fieldProps)}</div>
                <br />
              </div>
            );
          },
        } as FormInput;
      }),
    [formState, inputs]
  );

  const entries = formInputs.map(({ name, rules, render }) => (
    <Controller<typeof formDefaultValues>
      key={name}
      name={name}
      control={methods.control}
      rules={rules}
      render={render}
    />
  ));

  return (
    <WizardLayout header={header} footer={footer}>
      <div
        className={'FormDirt'}
      >{`Form dirtiness: ${methods.formState.isDirty}`}</div>
      <div className={styles.container}>{...entries}</div>
    </WizardLayout>
  );
};

export default ConfigureAlgorithm;
