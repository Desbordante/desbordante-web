import type { NextPage } from 'next';
import Button from '@components/Button';
import ExternalLink from '@components/ExternalLink';
import styles from '@styles/ChooseFile.module.scss';
import plexus from '@public/plexus.jpg';
import threeDots from '@assets/icons/three-dots.svg';
import arrowDown from '@assets/icons/arrow-down.svg';
import uploadIcon from '@assets/icons/upload.svg';
import { useContext, useEffect } from 'react';
import { AuthContext } from '@components/AuthContext';
import { useQuery } from '@apollo/client';
import { getAlgorithmsConfig } from '@graphql/operations/queries/__generated__/getAlgorithmsConfig';
import { GET_ALGORITHMS_CONFIG } from '@graphql/operations/queries/getAlgorithmsConfig';
import { ErrorContext } from '@components/ErrorContext';
import { limitString } from '@utils/strings';

const ChooseFile: NextPage = () => {
  const {user} = useContext(AuthContext)!
  const {showError} = useContext(ErrorContext)!

  const { loading, data, error } = useQuery<getAlgorithmsConfig>(
    GET_ALGORITHMS_CONFIG
  );

  const builtInDatasets = data?.algorithmsConfig?.allowedDatasets


  useEffect(() => {
    if (error) {
      showError({
        message: error.message,
        suggestion: "Please, try reloading the page.",
      });
    }
  })

  const userFiles = (
    <>
        <h5>My Files <img src={arrowDown.src} width={20} /></h5>
        {user?.permissions.canUploadFiles && (
          <div className={styles.files}>
            <div className={styles.card}>
              <div className={styles.uploader_title}><img src={uploadIcon.src} width={20} /><p>Upload a File</p></div>
            </div>
            <div className={`${styles.card} ${styles.selected}`}>
              <div className={styles.card_title}><p>my-data-file.csv</p><img src={threeDots.src} width={20} /></div>
              <div className={styles.card_description}>
                <span>421 KB: 152 rows, 13 columns</span>
                <span>Uploaded 15 minutes ago</span>
              </div>
            </div>
          </div>
        ) || <p>You must be authorized to upload files</p>}

    </>)
  const datasets = (
    <>
      <h5>Built-in Datasets <img src={arrowDown.src} width={20} /></h5>
      <div className={styles.files}>
        {user?.permissions.canUseBuiltinDatasets && builtInDatasets && builtInDatasets.map(file => (
            <div className={styles.card}>
              <div className={styles.card_title}><p>{limitString(file.fileName, 14)}</p><img src={threeDots.src} width={20} /></div>
              <div className={styles.card_description}>
                <span>421 KB: {file.rowsCount} rows, {file.countOfColumns} columns</span>
                <span>Uploaded 15 minutes ago</span>
              </div>
            </div>
        ))}
      </div>

    </>)
  return (
    <div className={styles.home}>

      <div className={styles.background}>
        <img
          src={plexus.src}
          className={styles.background_image}
          alt="background"
        />
      </div>
      
      <div className={styles.home_text}>
        <h2 className={styles.name_main}>Choose a File</h2>
        <h6 className={styles.description}>We have prepared some datasets for you</h6>
      </div>


      <div className={styles.userFiles}>
        {user?.permissions.canUploadFiles && <>{userFiles}{datasets}</> || <>{datasets}{userFiles}</>}
      </div>

    </div>
  );
};

export default ChooseFile;
