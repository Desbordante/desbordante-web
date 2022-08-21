import type { NextPage } from 'next';
import { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '@components/AuthContext';
import { ErrorContext } from '@components/ErrorContext';
import _ from 'lodash';
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
import { Controller, useForm } from 'react-hook-form';

const ConfigureAlgorithm: NextPage = () => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({});

  const router = useRouter();
  const fileID = router.query.fileID;
  const primitive = router.query.primitive as MainPrimitiveType;

  const { user } = useContext(AuthContext)!;
  const { showError } = useContext(ErrorContext)!;
  const FDoptions = [
    { label: 'Pyro', value: 'Pyro' },
    { label: 'TaneX', value: 'TaneX' },
    { label: 'FastFDs', value: 'FastFDs' },
    { label: 'FD mine', value: 'FD mine' },
    { label: 'DFD', value: 'DFD' },
    { label: 'Deep Miner', value: 'Deep Miner' },
    { label: 'FDep', value: 'FDep' },
    { label: 'FUN', value: 'FUN' },
  ];
  const CFDoptions = [{ label: 'CTane', value: 'CTane' }];
  const ARoptions = [{ label: 'Apriori', value: 'Apriori' }];
  const ApproxOptions = [{ label: 'Pyro', value: 'Pyro' }];
  const TypoOptions = [
    { label: 'FastFDs', value: 'FastFDs' },
    { label: 'FD mine', value: 'FD mine' },
    { label: 'DFD', value: 'DFD' },
    { label: 'Deep Miner', value: 'Deep Miner' },
    { label: 'FDep', value: 'FDep' },
    { label: 'FUN', value: 'FUN' },
  ];
  const [algorithm, setAlgorithm] = useState(FDoptions[0]);
  const { loading, data, error } = useQuery<getAlgorithmsConfig>(
    GET_ALGORITHMS_CONFIG
  );

  const header = (
    <>
      <h2 className={styles.name_main}>Configure Algorithm</h2>
      <h6 className={styles.description}>
        Vitae ipsum leo ut tincidunt viverra nec cum.
      </h6>
    </>
  );

  const footer = (
    <>
      <Button variant="secondary" onClick={() => router.back()}>
        Go Back
      </Button>
      <Button
        variant="primary"
        icon={ideaIcon}
        onClick={handleSubmit((d) => console.log(d))}
      >
        Analyze
      </Button>
    </>
  );

  return (
    <WizardLayout header={header} footer={footer}>
      <div className={styles.container}>
        {primitive === MainPrimitiveType.FD && (
          <>
            <Controller
              name="algorithm"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  // value={algorithm}
                  // onChange={(option: any) => setAlgorithm(option)}
                  label="Algorithm"
                  options={FDoptions}
                />
              )}
            />

            <Controller
              name="threshold"
              control={control}
              render={({ field }) => (
                <NumberSlider
                  {...field}
                  sliderProps={{ min: 0, max: 1, step: 1e-6 }}
                  label="Error threshold"
                />
              )}
            />

            <Controller
              name="arity"
              control={control}
              render={({ field }) => (
                <NumberSlider
                  {...field}
                  sliderProps={{ min: 1, max: 10, step: 1 }}
                  label="Arity constraint"
                />
              )}
            />

            <Controller
              name="threads"
              control={control}
              render={({ field }) => (
                <NumberSlider
                  {...field}
                  sliderProps={{ min: 1, max: 16, step: 1 }}
                  label="Thread count"
                />
              )}
            />
          </>
        )}

        {primitive === MainPrimitiveType.CFD && (
          <>
            <Controller
              name="algorithm"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  value={algorithm}
                  onChange={(option: any) => setAlgorithm(option)}
                  label="Algorithm"
                  options={CFDoptions}
                />
              )}
            />

            <Controller
              name="min_confidence"
              control={control}
              render={({ field }) => (
                <NumberSlider
                  {...field}
                  sliderProps={{ min: 0, max: 1, step: 1e-6 }}
                  label="Minimum confidence"
                />
              )}
            />

            <Controller
              name="arity"
              control={control}
              render={({ field }) => (
                <NumberSlider
                  {...field}
                  sliderProps={{ min: 1, max: 10, step: 1 }}
                  label="Arity constraint"
                />
              )}
            />

            <Controller
              name="min_support"
              control={control}
              render={({ field }) => (
                <NumberSlider
                  {...field}
                  sliderProps={{ min: 1, max: 16, step: 1 }}
                  label="Minimum support"
                />
              )}
            />
          </>
        )}

        {primitive === MainPrimitiveType.AR && (
          <>
            <Controller
              name="algorithm"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  value={algorithm}
                  onChange={(option: any) => setAlgorithm(option)}
                  label="Algorithm"
                  options={ARoptions}
                />
              )}
            />

            <Controller
              name="min_confidence"
              control={control}
              render={({ field }) => (
                <NumberSlider
                  {...field}
                  sliderProps={{ min: 0, max: 1, step: 1e-6 }}
                  label="Minimum confidence"
                />
              )}
            />

            <Controller
              name="min_support"
              control={control}
              render={({ field }) => (
                <NumberSlider
                  {...field}
                  sliderProps={{ min: 1, max: 16, step: 1 }}
                  label="Minimum support"
                />
              )}
            />
          </>
        )}

        {primitive === MainPrimitiveType.TypoFD && (
          <>
            <Controller
              name="precise_algorithm"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  // value={algorithm}
                  // onChange={(option: any) => setAlgorithm(option)}
                  label="Precise Algorithm"
                  options={TypoOptions}
                />
              )}
            />

            <Controller
              name="approximate_algorithm"
              control={control}
              render={({ field }) => (
                <Select
                  // value={algorithm}
                  // onChange={(option: any) => setAlgorithm(option)}
                  {...field}
                  label="Approximate Algorithm"
                  options={ApproxOptions}
                />
              )}
            />

            <Controller
              name="threshold"
              control={control}
              render={({ field }) => (
                <NumberSlider
                  {...field}
                  sliderProps={{ min: 0, max: 1, step: 1e-6 }}
                  label="Error threshold"
                />
              )}
            />

            <Controller
              name="arity"
              control={control}
              render={({ field }) => (
                <NumberSlider
                  {...field}
                  sliderProps={{ min: 1, max: 9, step: 1 }}
                  label="Arity constraint"
                />
              )}
            />

            <Controller
              name="threads"
              control={control}
              render={({ field }) => (
                <NumberSlider
                  {...field}
                  sliderProps={{ min: 1, max: 16, step: 1 }}
                  label="Thread count"
                />
              )}
            />

            <Controller
              name="radius"
              control={control}
              render={({ field }) => (
                <NumberSlider
                  {...field}
                  sliderProps={{ min: 1, max: 10, step: 1e-6 }}
                  label="Radius"
                />
              )}
            />

            <Controller
              name="ratio"
              control={control}
              render={({ field }) => (
                <NumberSlider
                  {...field}
                  sliderProps={{ min: 0, max: 1, step: 0.01 }}
                  label="Ratio"
                />
              )}
            />
          </>
        )}
      </div>
    </WizardLayout>
  );
};

export default ConfigureAlgorithm;
