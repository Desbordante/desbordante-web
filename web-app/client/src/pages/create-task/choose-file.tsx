import { useLazyQuery, useQuery } from '@apollo/client';
import _ from 'lodash';
import type { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import settingsIcon from '@assets/icons/settings.svg';
import { AuthContext } from '@components/AuthContext';
import Button from '@components/Button';
import { Collapse } from '@components/Collapse';
import { DatasetCard } from '@components/DatasetCard';
import { DatasetUploader } from '@components/DatasetUploader';
import { ErrorContext } from '@components/ErrorContext';
import WizardLayout from '@components/WizardLayout';
import client from '@graphql/client';
import { getAlgorithmsConfig } from '@graphql/operations/queries/__generated__/getAlgorithmsConfig';
import {
  getUser,
  getUserVariables,
  getUser_user_datasets,
} from '@graphql/operations/queries/__generated__/getUser';
import { GET_ALGORITHMS_CONFIG } from '@graphql/operations/queries/getAlgorithmsConfig';
import { GET_USER } from '@graphql/operations/queries/getUser';
import { useAuthContext, useUserDatasets } from '@hooks/useAuthContext';
import { useErrorContext } from '@hooks/useErrorContext';
import { useTaskUrlParams } from '@hooks/useTaskUrlParams';
import styles from '@styles/ChooseFile.module.scss';
import { showError } from '@utils/toasts';
import { AllowedDataset } from 'types/algorithms';
import { MainPrimitiveType } from 'types/globalTypes';

type Props = {
  defaultAlgorithmConfig: getAlgorithmsConfig | null;
  defaultUserDatasets: getUser_user_datasets[];
};

const ChooseFile: NextPage<Props> = ({ defaultAlgorithmConfig }) => {
  const router = useRouter();
  const { primitive, fileID } = useTaskUrlParams();

  const { user } = useAuthContext();
  const { data, error } = useQuery<getAlgorithmsConfig>(GET_ALGORITHMS_CONFIG);
  const allowedDatasets = (
    (data || defaultAlgorithmConfig)?.algorithmsConfig?.allowedDatasets || []
  ).filter((e) =>
    e.supportedPrimitives.includes(primitive as MainPrimitiveType)
  );
  const [builtInDatasets, _otherDatasets] = _.partition(
    allowedDatasets,
    (e) => e.isBuiltIn
  );
  const { userDatasets, setUserDatasets } = useUserDatasets();
  const [selection, setSelection] = useState<AllowedDataset>();

  useEffect(() => {
    if (error) {
      showError(error.message, 'Please, try reloading the page.');
    }
  }, []);

  useEffect(() => {
    const queryFile =
      userDatasets.find((f) => f.fileID === fileID) ||
      builtInDatasets.find((f) => f.fileID === fileID);
    if (queryFile) {
      setSelection(queryFile);
    }
  }, [fileID]);

  const userFiles = (
    <Collapse
      title="My Files"
      titleProps={{ className: styles.collapse_title }}
    >
      {(user?.permissions.canUploadFiles && (
        <div className={styles.files}>
          <DatasetUploader
            onUpload={(dataset) => {
              setUserDatasets([...userDatasets, dataset]);
              setSelection(dataset);
            }}
          />

          {user?.permissions.canUploadFiles &&
            userDatasets &&
            userDatasets.map((file) => (
              <DatasetCard
                isSelected={selection === file}
                onClick={() => setSelection(file)}
                file={file}
              />
            ))}
        </div>
      )) || <p>You must be authorized to upload files</p>}
    </Collapse>
  );

  const datasets = (
    <Collapse
      title="Built-in Datasets"
      titleProps={{ className: styles.collapse_title }}
    >
      <div className={styles.files}>
        {user?.permissions.canUseBuiltinDatasets &&
          builtInDatasets &&
          builtInDatasets.map((file) => (
            <DatasetCard
              isSelected={selection === file}
              onClick={() => setSelection(file)}
              file={file}
            />
          ))}
      </div>
    </Collapse>
  );

  const header = (
    <>
      <h2 className={styles.name_main}>Choose a File</h2>
      <h6 className={styles.description}>
        We have prepared some datasets for you
      </h6>
    </>
  );

  const footer = (
    <>
      <Button variant="secondary">Go Back</Button>
      <Button
        disabled={!selection}
        variant="primary"
        icon={settingsIcon}
        onClick={() =>
          router.push({
            pathname: '/create-task/configure-algorithm',
            query: { ...router.query, primitive, fileID: selection?.fileID },
          })
        }
      >
        Configure algorithm
      </Button>
    </>
  );

  return (
    <WizardLayout header={header} footer={footer}>
      {(user?.permissions.canUploadFiles && (
        <>
          {userFiles}
          {datasets}
        </>
      )) || (
        <>
          {datasets}
          {userFiles}
        </>
      )}
    </WizardLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { data: defaultAlgorithmConfig } = await client.query({
    query: GET_ALGORITHMS_CONFIG,
  });

  return {
    props: { defaultAlgorithmConfig },
  };
};

export default ChooseFile;
