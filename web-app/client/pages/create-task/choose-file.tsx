import type { NextPage } from 'next';
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '@components/AuthContext';
import { useQuery } from '@apollo/client';
import { getAlgorithmsConfig } from '@graphql/operations/queries/__generated__/getAlgorithmsConfig';
import { GET_ALGORITHMS_CONFIG } from '@graphql/operations/queries/getAlgorithmsConfig';
import { ErrorContext } from '@components/ErrorContext';
import { AllowedDataset } from 'types/algorithms';
import _ from 'lodash';
import { DatasetCard } from '@components/DatasetCard/DatasetCard';
import { MainPrimitiveType } from 'types/globalTypes';
import { Collapse } from '@components/Collapse/Collapse';
import Button from '@components/Button';
import styles from '@styles/ChooseFile.module.scss';
import settingsIcon from '@assets/icons/settings.svg';
import { WizardLayout } from '@components/WizardLayout/WizardLayout';
import DatasetUploader from '@components/DatasetUploader/DatasetUploader';

const ChooseFile: NextPage = () => {
  const router = useRouter();
  const primitive = router.query.primitive || 'FD';
  const { user } = useContext(AuthContext)!;
  const { showError } = useContext(ErrorContext)!;
  const { loading, data, error } = useQuery<getAlgorithmsConfig>(
    GET_ALGORITHMS_CONFIG
  );
  const allowedDatasets = (
    data?.algorithmsConfig?.allowedDatasets || []
  ).filter((e) =>
    e.supportedPrimitives.includes(primitive as MainPrimitiveType)
  );
  const [builtInDatasets, _otherDatasets] = _.partition(
    allowedDatasets,
    (e) => e.isBuiltIn
  );
  const [userDatasets, setUserDatasets] = useState(user?.datasets || []);
  const [selection, setSelection] = useState<AllowedDataset>();

  useEffect(() => {
    if (error) {
      showError({
        message: error.message,
        suggestion: 'Please, try reloading the page.',
      });
    }
  }, []);

  useEffect(() => {
    const queryFile =
      userDatasets.find((f) => f.fileID === router.query.fileID) ||
      builtInDatasets.find((f) => f.fileID === router.query.fileID);
    if (queryFile) {
      setSelection(queryFile);
    }
  }, [router.query.fileID]);

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
            query: { primitive, fileID: selection?.fileID },
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

export default ChooseFile;
