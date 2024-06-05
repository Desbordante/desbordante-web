import { FC } from 'react';
import {
  FilePropsForm,
  FilePropsList,
} from '@components/FilePropertiesModal/tabs/PropertiesTab';
import { StatsTab } from '@components/FilePropertiesModal/tabs/StatsTab';
import ModalContainer, { ModalProps } from '@components/ModalContainer';
import { Tab, TabView } from '@components/TabView/TabView';
import { AllowedDataset } from 'types/algorithms';
import { FileProps } from 'types/globalTypes';
import styles from './FilePropertiesModal.module.scss';

type Props = ModalProps &
  (
    | {
        data: AllowedDataset;
        fileID: string;
      }
    | {
        onSubmit: (values: FileProps) => void;
      }
  );

const FilePropertiesModal: FC<Props> = ({ isOpen, onClose, ...props }) => {
  
  return (
    <ModalContainer isOpen={isOpen} onClose={onClose}>
      <h4 className={styles.header}>File Properties</h4>
      {'data' in props ? (
        <TabView>
          <Tab name="Properties">
            <FilePropsList {...props} />
          </Tab>
          <Tab name="Statistics">
            <StatsTab {...props} onClose={onClose} />
          </Tab>
        </TabView>
      ) : (
        <FilePropsForm {...props} onClose={onClose} />
      )}
    </ModalContainer>
  );
};

export default FilePropertiesModal;
