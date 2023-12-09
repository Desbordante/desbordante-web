import cn from 'classnames';
import { useRouter } from 'next/router';
import FormFooter from '@components/AlgorithmFormConfigurator/FormFooter';
import FormHeader from '@components/AlgorithmFormConfigurator/FormHeader';
import useFormFactory from '@components/AlgorithmFormConfigurator/useFormFactory';
import PresetSelector from '@components/PresetSelector';
import WizardLayout from '@components/WizardLayout';
import { UsedPrimitivesType } from '@constants/formPrimitives';
import styles from './ConfigureAlgorithm.module.scss';

type QueryProps<T extends UsedPrimitivesType> = {
  primitive: T;
  fileID: string;
  formParams: { [key: string]: string | string[] | undefined };
};

const AlgorithmFormConfigurator = <T extends UsedPrimitivesType>({
  primitive,
  fileID,
  formParams,
}: QueryProps<T>) => {
  const router = useRouter();

  const {
    methods,
    entries,
    formPresets,
    fileNameLoading,
    changePreset,
    onSubmit,
  } = useFormFactory({
    fileID,
    primitive,
    formParams,
  });
  
  return (
    <WizardLayout header={FormHeader} footer={FormFooter(router, onSubmit)}>
      <div
        className={cn(
          styles.baseFormContainer,
          entries.length > 4 && styles.bigFormContainer,
        )}
      >
        <div
          className={
            styles[
              entries.length > 4
                ? 'containerOver4Inputs'
                : 'baseFormContainer'
            ]
          }
        >
          <PresetSelector
            presets={formPresets}
            isCustom={methods.formState.isDirty}
            changePreset={changePreset}
            isLoading={fileNameLoading}
          />
        </div>

        <div className={styles.line} />
        <div
          className={
            styles[
              entries.length > 4
                ? 'containerOver4Inputs'
                : 'containerLess4Inputs'
            ]
          }
        >
          {entries}
        </div>
      </div>
    </WizardLayout>
  );
};

export default AlgorithmFormConfigurator;
