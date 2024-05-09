import { FC } from 'react';
import { FilePropsList } from '@components/choose-file/FilePropertiesModal/tabs/PropertiesTab';
import ModalContainer, {
  ModalProps,
} from '@components/common/layout/ModalContainer';
import { AllowedDataset } from 'types/algorithms';
import styles from './FilePropertiesModal.module.scss';

type Props = ModalProps & { data: AllowedDataset };

const FilePropertiesModal: FC<Props> = ({ onClose, ...props }) => {
  return (
    <ModalContainer onClose={onClose}>
      <h4 className={styles.header}>File Properties</h4>
      <FilePropsList {...props} />
    </ModalContainer>
  );
};

export default FilePropertiesModal;
