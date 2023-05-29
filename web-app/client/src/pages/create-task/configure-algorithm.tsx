import { useMutation, useQuery } from '@apollo/client';
import _ from 'lodash';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  useForm,
  UseFormStateReturn,
  useWatch,
} from 'react-hook-form';
import { UseControllerProps } from 'react-hook-form/dist/types/controller';
import { Entries } from 'type-fest';
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
import PresetSelector from '@components/PresetSelector';
import WizardLayout from '@components/WizardLayout';
import { ARForm } from '@constants/configuratorForm/ARForm';
import { CFDForm } from '@constants/configuratorForm/CFDForm';
import { FDForm } from '@constants/configuratorForm/FDForm';
import { MFDForm } from '@constants/configuratorForm/MFDForm';
import { TYPOFDForm } from '@constants/configuratorForm/TypoFDForm';
import {
  createTaskWithDatasetChoosing,
  createTaskWithDatasetChoosingVariables,
} from '@graphql/operations/mutations/__generated__/createTaskWithDatasetChoosing';
import { CREATE_TASK_WITH_CHOOSING_DATASET } from '@graphql/operations/mutations/chooseTask';
import {
  getFileName,
  getFileNameVariables,
} from '@graphql/operations/queries/__generated__/getFileName';
import { GET_FILE_NAME } from '@graphql/operations/queries/getFileName';
import { useTaskUrlParams } from '@hooks/useTaskUrlParams';
import styles from '@styles/ConfigureAlgorithm.module.scss';
import { showError } from '@utils/toasts';
import {
  FormFieldsProps,
  FormHook,
  FormInputElement,
  FormInputProps,
  FormProcessor,
  Presets,
} from 'types/form';
import {
  IntersectionMainTaskProps,
  MainPrimitiveType,
} from 'types/globalTypes';

const primitives = {
  [MainPrimitiveType.FD]: FDForm,
  [MainPrimitiveType.AR]: ARForm,
  [MainPrimitiveType.CFD]: CFDForm,
  [MainPrimitiveType.TypoFD]: TYPOFDForm,
  [MainPrimitiveType.MFD]: MFDForm,
};
type UsedPrimitivesType = keyof typeof primitives;
const excludedPrimitives = [MainPrimitiveType.Stats];

const ConfigureAlgorithm: NextPage = () => {
  const router = useRouter();
  const {
    primitive: { value: primitiveValue },
    fileID,
    config,
  } = useTaskUrlParams();

  if (router.isReady && !primitiveValue) {
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
      {excludedPrimitives.includes(primitiveValue as UsedPrimitivesType) && (
        <div className={styles.filler}>
          <h6>
            &quot;{primitiveValue}&quot; primitive does not have configurator
          </h6>
        </div>
      )}
      {primitiveValue &&
        fileID.value &&
        !excludedPrimitives.includes(primitiveValue) && (
          <FormComponent
            primitive={primitiveValue as UsedPrimitivesType}
            fileID={fileID.value}
            formParams={config.value}
          />
        )}
    </>
  );
};

type QueryProps<T extends UsedPrimitivesType> = {
  primitive: T;
  fileID: string;
  formParams: { [key: string]: string | string[] | undefined };
};

const FormComponent = <T extends UsedPrimitivesType>({
  primitive,
  fileID,
  formParams,
}: QueryProps<T>) => {
  const router = useRouter();

  const formObject = primitives[primitive];

  const formDefaultValues = useMemo(
    () =>
      ({
        ...formObject.formDefaults,
        ...formParams,
      } as typeof formObject.formDefaults),
    [formObject, formParams]
  );
  const formFields = formObject.formFields as FormFieldsProps<
    typeof formDefaultValues
  >;

  const { loading: fileNameLoading, data: fileNameData } = useQuery<
    getFileName,
    getFileNameVariables
  >(GET_FILE_NAME, {
    variables: { fileID },
    onError: (error) => {
      showError(
        error.message,
        "Can't fetch file information. Please try later."
      );
    },
  });

  const formPresets = useMemo(
    () =>
      [
        ...(fileNameLoading
          ? []
          : formObject.formPresets.filter(
              (value) => value.filename === fileNameData?.datasetInfo?.fileName
            )),
        {
          filename: '',
          presetName: 'Default',
          preset: formObject.formDefaults,
        },
        {
          filename: '',
          presetName: 'Custom',
          preset: {},
        },
      ] as Presets<typeof formObject.formDefaults>,
    [fileNameData?.datasetInfo?.fileName, fileNameLoading, formObject]
  );

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

  const methods = useForm<typeof formDefaultValues>({
    mode: 'onChange',
    defaultValues: formPresets[0].preset,
  });

  const [formState, setFormState] = useState(formFields);

  const depsIndex = useRef(0);

  const [createTask] = useMutation<
    createTaskWithDatasetChoosing,
    createTaskWithDatasetChoosingVariables
  >(CREATE_TASK_WITH_CHOOSING_DATASET);

  const onSubmit = methods.handleSubmit(
    (data) => {
      const clientOnlyFields = (
        Object.entries(formState) as Entries<typeof formState>
      )
        .filter(([, fieldState]) => {
          return (fieldState as FormInputProps).clientOnly;
        })
        .map(([name]) => name);
      const cleanedData = _.omit(
        data,
        clientOnlyFields
      ) as IntersectionMainTaskProps;
      createTask({
        variables: {
          fileID,
          props: {
            ...cleanedData,
            type: primitive,
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
    },
    () => {
      showError('Input error', 'You need to correct the errors in the form.');
    }
  );

  useFormHook(fileID, formState, setFormState, methods);

  const watchDeps = useWatch({
    control: methods.control,
    name: formLogicDeps[depsIndex.current],
  });

  useEffect(() => {
    formLogic(formState, setFormState, methods, depsIndex);
    methods.trigger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  type FormInput = {
    name: keyof typeof formDefaultValues;
    rules?: UseControllerProps<typeof formDefaultValues>['rules'];
    render: (props: {
      field: ControllerRenderProps<typeof formDefaultValues>;
      fieldState: ControllerFieldState;
      formState: UseFormStateReturn<typeof formDefaultValues>;
    }) => React.ReactElement;
  };

  // Exclude inputs with isConstant parameter
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
          render: ({ field, fieldState }) => {
            if (
              typeof fieldProps.isDisplayable === 'boolean' &&
              !fieldProps.isDisplayable
            )
              return;

            if (fieldProps.type in inputs) {
              const Component = inputs[fieldProps.type];
              return (
                <Component
                  field={field}
                  props={{
                    ...fieldProps,
                    error: fieldState.error?.message,
                  }}
                />
              );
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

  const changePreset = useCallback(
    (presetIndex: number) => {
      if (presetIndex !== -1) {
        methods.reset({
          ...formDefaultValues,
          ...formPresets[presetIndex].preset,
        });
        methods.trigger();
      }
    },
    [formDefaultValues, formPresets, methods]
  );

  return (
    <WizardLayout header={header} footer={footer}>
      <div className={styles.container}>
        <PresetSelector
          presetOptions={formPresets.map((elem, index) => ({
            label: elem.presetName,
            value: elem.presetName !== 'Custom' ? index : -1,
          }))}
          isCustom={methods.formState.isDirty}
          changePreset={changePreset}
          isLoading={fileNameLoading}
        />
      </div>
      <div className={styles.line} />
      <div className={styles.container}>{entries}</div>
    </WizardLayout>
  );
};

export default ConfigureAlgorithm;
