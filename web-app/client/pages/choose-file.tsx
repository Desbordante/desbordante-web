import type { NextPage } from 'next';
import { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '@components/AuthContext';
import { useQuery } from '@apollo/client';
import { getAlgorithmsConfig } from '@graphql/operations/queries/__generated__/getAlgorithmsConfig';
import { GET_ALGORITHMS_CONFIG } from '@graphql/operations/queries/getAlgorithmsConfig';
import { ErrorContext } from '@components/ErrorContext';
import { AllowedDataset } from 'types/algorithms';
import _ from 'lodash'
import { BaseCard, DatasetCard, FileCard } from '@components/DatasetCard/DatasetCard';
import { MainPrimitiveType } from 'types/globalTypes';
import { Collapse } from '@components/Collapse/Collapse';
import Button from '@components/Button';
import styles from '@styles/ChooseFile.module.scss';
import uploadIcon from '@assets/icons/upload.svg';
import settingsIcon from '@assets/icons/settings.svg';
import { WizardLayout } from '@components/WizardLayout/WizardLayout';

interface ChooseFileProps {
  primivite?: MainPrimitiveType
}

const ChooseFile: NextPage<ChooseFileProps> = ({primivite = MainPrimitiveType.FD}) => {
  const {user} = useContext(AuthContext)!
  const {showError} = useContext(ErrorContext)!
  const { loading, data, error } = useQuery<getAlgorithmsConfig>(
    GET_ALGORITHMS_CONFIG
  );
  const allowedDatasets = (data?.algorithmsConfig?.allowedDatasets || []).filter(e => e.supportedPrimitives.includes(primivite))
  const [builtInDatasets, userDatasets] = _.partition(allowedDatasets, e => e.isBuiltIn)
  const [uploadingFile, setUploadingFile] = useState<File>()
  const [selection, setSelection] = useState<AllowedDataset|File>()
  const inputFile = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (error) {
      showError({
        message: error.message,
        suggestion: "Please, try reloading the page.",
      });
    }
  })

  const userFiles = (
    <Collapse title="My Files" titleProps={{className: styles.collapse_title}}>
      {user?.permissions.canUploadFiles && (
        <div className={styles.files}>
          <BaseCard>
            <div className={styles.uploader_title} onClick={() => inputFile?.current?.click()}><img src={uploadIcon.src} width={20} /><p>Upload a File</p></div>
            <input
              type="file"
              id="file"
              ref={inputFile}
              style={{display: "none"}}
              onChange={
                e => {
                  if (e.target.files?.length) {
                    setUploadingFile(e.target.files[0])
                    setSelection(e.target.files[0])
                  }
                }
              }
              multiple={false}
              accept=".csv, .CSV"
            />
          </BaseCard>    
          {uploadingFile && (
            <FileCard isSelected={selection === uploadingFile} onClick={() => setSelection(uploadingFile)} file={uploadingFile} />
          )}

          {user?.permissions.canUploadFiles && userDatasets && userDatasets.map(file => <DatasetCard isSelected={selection === file} onClick={() => setSelection(file)} file={file} />)} 
        </div>) || <p>You must be authorized to upload files</p>}
    </Collapse>)

  const datasets = (
    <Collapse title="Built-in Datasets" titleProps={{className: styles.collapse_title}}>
      <div className={styles.files}>
        {user?.permissions.canUseBuiltinDatasets && builtInDatasets && builtInDatasets.map(file => <DatasetCard isSelected={selection === file} onClick={() => setSelection(file)} file={file} />)}
      </div>
    </Collapse>)

  const header = <>
    <h2 className={styles.name_main}>Choose a File</h2>
    <h6 className={styles.description}>We have prepared some datasets for you</h6>
  </>

  const footer = <>
    <Button variant="secondary">Go Back</Button>
    <Button variant="primary" icon={settingsIcon}>Configure algorithm</Button>
  </>

  return (
    <WizardLayout header={header} footer={footer}>
      {user?.permissions.canUploadFiles && <>{userFiles}{datasets}</> || <>{datasets}{userFiles}</>}
    </WizardLayout>
  );
};

export default ChooseFile;
