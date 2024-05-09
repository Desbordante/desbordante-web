import { FC } from 'react';
import ModalContainer, {
  ModalProps,
} from '@components/common/layout/ModalContainer';
import { AllowedDataset } from 'types/algorithms';
import { FileProps } from 'types/globalTypes';
import { Tab, TabView } from './components/TabView/TabView';
import { FilePropsForm, FilePropsList } from './tabs/PropertiesTab';
import { StatsTab } from './tabs/StatsTab';
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

const FilePropertiesModal: FC<Props> = ({ onClose, ...props }) => {
  return (
    <ModalContainer onClose={onClose}>
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
