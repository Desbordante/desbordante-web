import moment from 'moment';
import prettyBytes from 'pretty-bytes';
import { FC, useState } from 'react';
import FileIcon from '@assets/icons/file.svg?component';
import Button from '@components/Button';
import { getDatasetsInfo_datasets_data } from '@graphql/operations/queries/__generated__/getDatasetsInfo';
import FilePropertiesModal from './FilePropertiesModal';
import styles from './DatasetItem.module.scss';

interface Props {
  data: getDatasetsInfo_datasets_data;
  displayUserName?: boolean;
}

const DatasetItem: FC<Props> = ({ data, displayUserName = false }) => {
  const {
    originalFileName,
    fileFormat,
    fileSize,
    createdAt,
    user,
    numberOfUses,
  } = data;

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <li className={styles.datasetItem}>
      <div className={styles.iconContainer}>
        <FileIcon className={styles.icon} />
      </div>
      <div className={styles.middle}>
        <div className={styles.top}>
          <div className={styles.fileName} title={originalFileName}>
            {originalFileName}
          </div>
          {fileFormat?.inputFormat && (
            <div className={styles.fileType}>{fileFormat?.inputFormat}</div>
          )}
          <div className={styles.numberOfUses}>{numberOfUses} uses</div>
        </div>
        <div className={styles.bottom}>
          <div className={styles.size}>
            {prettyBytes(fileSize, { binary: true })}
          </div>
          <div className={styles.createdAt}>
            {moment(+createdAt).format('[Uploaded] L LT')}
          </div>
          {displayUserName && (
            <div className={styles.user}>{user?.fullName ?? 'Anonymous'}</div>
          )}
        </div>
      </div>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsModalOpen(true)}
      >
        Properties
      </Button>
      {isModalOpen && (
        <FilePropertiesModal
          data={data}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </li>
  );
};

export default DatasetItem;
