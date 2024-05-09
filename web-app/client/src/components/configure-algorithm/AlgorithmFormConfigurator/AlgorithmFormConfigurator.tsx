import { useRouter } from 'next/router';
import WizardLayout from '@components/common/layout/WizardLayout';
import { UsedPrimitivesType } from '@constants/formPrimitives';
import styles from '@styles/ConfigureAlgorithm.module.scss';
import PresetSelector from './components/PresetSelector';
import FormFooter from './FormFooter';
import FormHeader from './FormHeader';
import useFormFactory from './useFormFactory';

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
      <div className={styles.container}>
        <PresetSelector
          presets={formPresets}
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

export default AlgorithmFormConfigurator;
