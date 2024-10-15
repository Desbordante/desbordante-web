import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import React from 'react';
import AlgorithmFormConfigurator from '@components/AlgorithmFormConfigurator';
import {
  excludedPrimitives,
  UsedPrimitivesType,
} from '@constants/formPrimitives';
import { useTaskUrlParams } from '@hooks/useTaskUrlParams';
import styles from '@styles/ConfigureAlgorithm.module.scss';

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
      <NextSeo title="Step 3: configure algorithm" />
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
          <AlgorithmFormConfigurator
            primitive={primitiveValue as UsedPrimitivesType}
            fileID={fileID.value}
            formParams={config.value}
          />
        )}
    </>
  );
};

export default ConfigureAlgorithm;
