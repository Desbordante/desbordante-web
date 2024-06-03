import { useMutation } from '@apollo/client';
import cn from 'classnames';
import { useRouter } from 'next/router';
import { FC, useState, useCallback, useLayoutEffect, useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import WizardLayout from '@components/common/layout/WizardLayout';
import {
  createTaskWithDatasetChoosing,
  createTaskWithDatasetChoosingVariables,
} from '@graphql/operations/mutations/__generated__/createTaskWithDatasetChoosing';
import { CREATE_TASK_WITH_CHOOSING_DATASET } from '@graphql/operations/mutations/chooseTask';
import { showError } from '@utils/toasts';
import { MainPrimitiveType } from 'types/globalTypes';
import { FormData, FormComponent, Presets } from '../types/form';
import FormFooter from './components/FormFooter';
import FormHeader from './components/FormHeader';
import PresetSelector from './components/PresetSelector';
import styles from './FormLayout.module.scss';

export type FormLayoutProps = {
  fileID: string;
  primitive: MainPrimitiveType;
  FormComponent: FormComponent;
  startValues?: FormData;
};

const FormLayout: FC<FormLayoutProps> = ({
  fileID,
  primitive,
  startValues,
  FormComponent,
}) => {
  const router = useRouter();
  const methods = useForm<FormData>({
    mode: 'all',
    reValidateMode: 'onChange',
    values: startValues,
  });

  const [createTask] = useMutation<
    createTaskWithDatasetChoosing,
    createTaskWithDatasetChoosingVariables
  >(CREATE_TASK_WITH_CHOOSING_DATASET);

  const onSubmit = useCallback(
    (data: FormData) => {
      const fieldData = FormComponent.onSubmit(data);

      console.log(fieldData);
      // return;

      createTask({
        variables: {
          fileID,
          props: {
            ...fieldData,
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
          }),
        )
        .catch((error) => {
          if (error instanceof Error) {
            showError(
              error.message,
              'Internal error occurred. Please try later.',
            );
          }
        });
    },
    [FormComponent, createTask, fileID, primitive, router],
  );

  const [presets, setPresets] = useState<Presets>();
  const formRef = useRef<HTMLFormElement>(null);
  const [inputCount, setInputCount] = useState<number>(0);
  useLayoutEffect(() => {
    setInputCount(formRef.current!.children.length);
  }, []);

  return (
    <WizardLayout header={FormHeader} footer={<FormFooter />}>
      <div className={styles.presetSelectorContainer}>
        <PresetSelector
          fileID={fileID}
          isCustom={methods.formState.isDirty}
          formReset={methods.reset}
          formTrigger={methods.trigger}
          presets={presets}
        />
      </div>
      <div className={styles.line} />
      <FormProvider {...methods}>
        <form
          id="algorithmconfigurator"
          ref={formRef}
          className={cn(
            styles.formContainer,
            inputCount > 4 && styles.expanded,
          )}
          onSubmit={methods.handleSubmit(onSubmit)}
        >
          <FormComponent fileID={fileID} setPresets={setPresets} />
        </form>
      </FormProvider>
    </WizardLayout>
  );
};

export default FormLayout;
