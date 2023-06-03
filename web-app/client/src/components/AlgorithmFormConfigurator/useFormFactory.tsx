import { useMutation, useQuery } from '@apollo/client';
import _ from 'lodash';
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
import {
  FormCheckbox,
  FormMultiSelect,
  FormNumberInput,
  FormNumberSlider,
  FormRadio,
  FormSelect,
  FormText,
} from '@components/FormInputs';
import {
  CUSTOM_PRESET_INDEX,
  DEFAULT_PRESET_INDEX,
} from '@components/PresetSelector/PresetSelector';
import primitives, {
  FormObjectsType,
  UsedPrimitivesType,
} from '@constants/formPrimitives';
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
import { showError } from '@utils/toasts';
import {
  FormFieldsProps,
  FormHook,
  FormInputElement,
  FormInputProps,
  FormProcessor,
  Presets,
} from 'types/form';
import { IntersectionMainTaskProps } from 'types/globalTypes';

type FormFactoryProps<T extends UsedPrimitivesType> = {
  fileID: string;
  primitive: T;
  formParams: { [key: string]: string | string[] | undefined };
};

const useFormFactory = <T extends UsedPrimitivesType>({
  fileID,
  primitive,
  formParams,
}: FormFactoryProps<T>) => {
  const router = useRouter();

  const formObject = primitives[primitive] as FormObjectsType;

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

  // Can't move to preset selector because preset name might not be unique
  const formPresets = useMemo(
    () =>
      (fileNameLoading
        ? []
        : formObject.formPresets.filter(
            (value) =>
              value.filenames === 'EveryFile' ||
              (fileNameData?.datasetInfo?.fileName &&
                value.filenames.includes(fileNameData?.datasetInfo?.fileName))
          )) as Presets<typeof formObject.formDefaults>,
    [fileNameData?.datasetInfo?.fileName, fileNameLoading, formObject]
  );

  const methods = useForm<typeof formDefaultValues>({
    mode: 'onChange',
    defaultValues: formDefaultValues,
  });

  const [formState, setFormState] = useState(formFields);

  const depsIndex = useRef(0);

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
          render: ({ field, fieldState }) => {
            if ('isDisplayable' in fieldProps && !fieldProps.isDisplayable)
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
      if (presetIndex === DEFAULT_PRESET_INDEX) {
        methods.reset(formDefaultValues);
      } else if (presetIndex !== CUSTOM_PRESET_INDEX) {
        methods.reset({
          ...formDefaultValues,
          ...formPresets[presetIndex].preset,
        });
      }
      methods.trigger();
      formLogic(formState, setFormState, methods, depsIndex);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formDefaultValues, formLogic, formPresets, methods]
  );

  return {
    methods,
    entries,
    formPresets,
    fileNameLoading,
    changePreset,
    onSubmit,
  } as const;
};

export default useFormFactory;
