import type { NextPage } from 'next';
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router'
import { AuthContext } from '@components/AuthContext';
import { useQuery } from '@apollo/client';
import { getAlgorithmsConfig } from '@graphql/operations/queries/__generated__/getAlgorithmsConfig';
import { GET_ALGORITHMS_CONFIG } from '@graphql/operations/queries/getAlgorithmsConfig';
import { ErrorContext } from '@components/ErrorContext';
import { AllowedDataset } from 'types/algorithms';
import _ from 'lodash'
import { DatasetCard } from '@components/DatasetCard/DatasetCard';
import { MainPrimitiveType } from 'types/globalTypes';
import { Collapse } from '@components/Collapse/Collapse';
import Button from '@components/Button';
import styles from '@styles/ChooseFile.module.scss';
import ideaIcon from '@assets/icons/idea.svg';
import { WizardLayout } from '@components/WizardLayout/WizardLayout';
import DatasetUploader from '@components/DatasetUploader/DatasetUploader';
import NumberSlider from '@components/Inputs/NumberSlider/NumberSlider';
import { Select } from '@components/Inputs';

const ConfigureAlgorithm: NextPage = () => {
  const router = useRouter()
  const { primitive, fileID } = router.query
  const {user} = useContext(AuthContext)!
  const {showError} = useContext(ErrorContext)!
  const { loading, data, error } = useQuery<getAlgorithmsConfig>(
    GET_ALGORITHMS_CONFIG
  );

  const allowedDatasets = (data?.algorithmsConfig?.allowedDatasets || []).filter(e => e.supportedPrimitives.includes((primitive || "FD") as MainPrimitiveType))
  const [builtInDatasets, _otherDatasets] = _.partition(allowedDatasets, e => e.isBuiltIn)
  const [userDatasets, setUserDatasets] = useState(user?.datasets || [])
  const [selection, setSelection] = useState<AllowedDataset>()
  const [fileIsDragged, setFileIsDragged] = useState(false)

  useEffect(() => {
    if (error) {
      showError({
        message: error.message,
        suggestion: "Please, try reloading the page.",
      });
    }
  })
  const header = <>
    <h2 className={styles.name_main}>Configure Algorithm</h2>
    <h6 className={styles.description}>Vitae ipsum leo ut tincidunt viverra nec cum.</h6>
  </>

  const footer = <>
    <Button variant="secondary" onClick={() => router.back()}>Go Back</Button>
    <Button variant="primary" icon={ideaIcon}>Analyze</Button>
  </>

  return (
    <WizardLayout header={header} footer={footer}>
      <div style={{width: 340, margin: 'auto'}}>
        <Select label="Algorithm" />
        <NumberSlider max={9} label="Error threshold" />
        <NumberSlider max={9} label="Arity constraint" />
        <NumberSlider max={9} label="Thread count" />
      </div>
    </WizardLayout>
  );
};

export default ConfigureAlgorithm;
