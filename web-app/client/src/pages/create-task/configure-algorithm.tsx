import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import FormLayout from '@components/configure-algorithm/FormLayout/FormLayout';
import {
  ARForm,
  CFDForm,
  MFDForm,
  FDForm,
  TypoFDForm,
} from '@components/configure-algorithm/forms';
import { FormComponent } from '@components/configure-algorithm/types/form';
import { FormData } from '@components/configure-algorithm/types/form';
import { useTaskUrlParams } from '@hooks/useTaskUrlParams';
import styles from '@styles/ConfigureAlgorithm.module.scss';
import { MainPrimitiveType } from 'types/globalTypes';

const forms: Partial<Record<MainPrimitiveType, FormComponent>> = {
  FD: FDForm,
  AR: ARForm,
  CFD: CFDForm,
  MFD: MFDForm,
  TypoFD: TypoFDForm,
};

const ConfigureAlgorithm: NextPage = () => {
  const router = useRouter();
  const {
    primitive: { value: primitiveValue },
    fileID,
    config,
  } = useTaskUrlParams();

  if (!router.isReady) return;

  if (router.isReady && primitiveValue === undefined) {
    router.push({
      pathname: '/create-task/choose-primitive',
      query: router.query,
    });
  }

  if (router.isReady && fileID.value === undefined) {
    router.push({
      pathname: '/create-task/choose-file',
      query: router.query,
    });
  }

  if (
    primitiveValue === undefined ||
    fileID.value === undefined ||
    !(primitiveValue in forms)
  ) {
    return (
      <div className={styles.filler}>
        <h6>
          &quot;{primitiveValue}&quot; primitive does not have configurator
        </h6>
      </div>
    );
  }

  return (
    <FormLayout
      fileID={fileID.value}
      primitive={primitiveValue}
      FormComponent={forms[primitiveValue as MainPrimitiveType]!}
      startValues={config.value as FormData}
    />
  );
};

export default ConfigureAlgorithm;
