import Button from '@components/Button';
import ModalContainer, { ModalProps } from '@components/ModalContainer';
import { FCWithChildren } from 'types/react';
import styles from './ListPropertiesModal.module.scss';

interface Props extends ModalProps {
  name: string;
  onApply: () => void;
}

const ListPropertiesModal: FCWithChildren<Props> = ({
  isOpen,
  name,
  onClose,
  onApply,
  children,
}) => {
  return (
    <ModalContainer isOpen={isOpen} onClose={onClose}>
      <h4 className={styles.title}>{name}</h4>
      <div className={styles.inputs}>{children}</div>
      <div className={styles.buttons}>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onApply}>Apply</Button>
      </div>
    </ModalContainer>
  );
};

export default ListPropertiesModal;
