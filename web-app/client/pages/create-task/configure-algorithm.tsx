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

const ConfigureAlgorithm: NextPage = () => {
  const router = useRouter()
  const { primitive, fileID } = router.query
  const {user} = useContext(AuthContext)!
  const {showError} = useContext(ErrorContext)!
  const options = [{label: "Pyro", value: "Pyro"},{label: "TaneX", value: "TaneX"},{label: "FastFDs", value: "FastFDs"},{label: "FD mine", value: "FD mine"},{label: "DFD", value: "DFD"},{label: "Deep Miner", value: "Deep Miner"},{label: "FDep", value: "FDep"},{label: "FUN", value: "FUN"}]
  const [algorithm, setAlgorithm] = useState(options[0])
  
  const header = <>
    <h2 className={styles.name_main}>Configure Algorithm</h2>
    <h6 className={styles.description}>Vitae ipsum leo ut tincidunt viverra nec cum.</h6>
  </>

  const footer = <>
    <Button variant="secondary" onClick={() => router.back()}>Go Back</Button>
    <Button variant="primary" icon={ideaIcon}>Analyze</Button>
  </>

  const marks = {1: {style: {top: -40}, label: "1"}, 3: " ", 5:{style: {top: -40}, label: "5"}, 7: " ", 9: {style: {top: -40}, label: "9"}}
  return (
    <WizardLayout header={header} footer={footer}>
      <div className={styles.container}>
        <Select value={algorithm} onChange={(option: any) => setAlgorithm(option)} label="Algorithm" options={options} />
        <NumberSlider disabled={["FastFDs", "FD mine", "DFD", "Deep miner", "FDep", "FUN"].indexOf(algorithm?.value) !== -1} sliderProps={{min: 1, max: 9, step: 0.1, marks}}  label="Error threshold" />
        <NumberSlider disabled={["FastFDs", "FD mine", "DFD", "Deep miner", "FDep", "FUN"].indexOf(algorithm?.value) !== -1}  sliderProps={{min: 1, max: 9, step: 0.1, marks}}  label="Arity constraint" />
        <NumberSlider disabled={["TaneX", "FD mine", "Deep miner", "FDep", "FUN"].indexOf(algorithm?.value) !== -1}  sliderProps={{min: 1, max: 9, step: 0.1, marks}}  label="Thread count" />
      </div>
    </WizardLayout>
  );
};

export default ConfigureAlgorithm;
