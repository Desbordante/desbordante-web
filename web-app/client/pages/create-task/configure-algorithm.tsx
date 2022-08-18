import type { NextPage } from 'next';
import { useContext, useState } from 'react';
import { useRouter } from 'next/router'
import { AuthContext } from '@components/AuthContext';
import { ErrorContext } from '@components/ErrorContext';
import _ from 'lodash'
import Button from '@components/Button';
import ideaIcon from '@assets/icons/idea.svg';
import { WizardLayout } from '@components/WizardLayout/WizardLayout';
import NumberSlider from '@components/Inputs/NumberSlider/NumberSlider';
import { Select } from '@components/Inputs';
import styles from '@styles/ConfigureAlgorithm.module.scss';
import { useQuery } from '@apollo/client';
import { getAlgorithmsConfig } from '@graphql/operations/queries/__generated__/getAlgorithmsConfig';
import { GET_ALGORITHMS_CONFIG } from '@graphql/operations/queries/getAlgorithmsConfig';
import { MainPrimitiveType } from 'types/globalTypes';

const ConfigureAlgorithm: NextPage = () => {
  const router = useRouter()
  const fileID = router.query.fileID
  const primitive = router.query.primitive as MainPrimitiveType

  const {user} = useContext(AuthContext)!
  const {showError} = useContext(ErrorContext)!
  const FDoptions = [{label: "Pyro", value: "Pyro"},{label: "TaneX", value: "TaneX"},{label: "FastFDs", value: "FastFDs"},{label: "FD mine", value: "FD mine"},{label: "DFD", value: "DFD"},{label: "Deep Miner", value: "Deep Miner"},{label: "FDep", value: "FDep"},{label: "FUN", value: "FUN"}]
  const CFDoptions = [{label: "CTane", value: "CTane"}]
  const [algorithm, setAlgorithm] = useState(FDoptions[0])
  const { loading, data, error } = useQuery<getAlgorithmsConfig>(
    GET_ALGORITHMS_CONFIG
  );

  console.log(data)

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
      <div className={styles.container}>
        {primitive === MainPrimitiveType.FD && <>
        <Select value={algorithm} onChange={(option: any) => setAlgorithm(option)} label="Algorithm" options={FDoptions} />
        <NumberSlider sliderProps={{min: 1, max: 9, step: 0.1}}  label="Error threshold" />
        <NumberSlider sliderProps={{min: 1, max: 9, step: 0.1}}  label="Arity constraint" />
        <NumberSlider sliderProps={{min: 1, max: 9, step: 0.1}}  label="Thread count" /></>}

        {primitive === MainPrimitiveType.CFD && <>
          <Select value={algorithm} onChange={(option: any) => setAlgorithm(option)} label="Algorithm" options={CFDoptions} />
          <NumberSlider sliderProps={{min: 0, max: 1, step: 1e-6}}  label="Minimum confidence" />
          <NumberSlider sliderProps={{min: 1, max: 10, step: 1}}  label="Arity constraint" />
          <NumberSlider sliderProps={{min: 1, max: 16, step: 1}}  label="Minimum support" /></>}
      </div>
    </WizardLayout>
  );
};

export default ConfigureAlgorithm;
