import { FC } from 'react';
import {
  FilePropsForm,
  FilePropsList,
} from '@components/FilePropertiesModal/tabs/PropertiesTab';
import { StatsTab } from '@components/FilePropertiesModal/tabs/StatsTab';
import ModalContainer, { ModalProps } from '@components/ModalContainer';
import { Tab, TabView } from '@components/TabView/TabView';
import { FileProps } from 'types/globalTypes';
import styles from './FilePropsView.module.scss';

type Props = ModalProps &
  (
    | {
        data: FileProps;
        fileID: string;
      }
    | {
        onSubmit: (values: FileProps) => void;
      }
  );

const FilePropertiesModal: FC<Props> = ({ onClose, ...props }) => {
  return (
    <ModalContainer onClose={onClose}>
      <h4 className={styles.header}>File Properties</h4>
      {'data' in props ? (
        <TabView>
          <Tab name="Properties">
            <FilePropsList {...props} />
          </Tab>
          <Tab name="Statistics">{/*<StatsTab fileID={fileID} />*/}</Tab>
        </TabView>
      ) : (
        <FilePropsForm {...props} onClose={onClose} />
      )}
    </ModalContainer>
  );
};

export default FilePropertiesModal;
