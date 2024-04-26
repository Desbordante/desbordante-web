import Button from '@components/Button';
import ModalContainer, { ModalProps } from '@components/ModalContainer';
import { FCWithChildren } from 'types/react';
import styles from './InputGroupModal.module.scss';

interface Props extends ModalProps {
  name: string;
  onApply: () => void;
  onReset: () => void;
}

const InputGroupModal: FCWithChildren<Props> = ({
  name,
  onClose,
  onApply,
  onReset,
  children,
}) => {
  return (
    <ModalContainer onClose={onClose}>
      <h4 className={styles.title}>{name}</h4>
      <div className={styles.inputs}>{children}</div>
      <div className={styles.buttons}>
        <Button variant="secondary-danger" onClick={onReset}>
          Reset
        </Button>
        <Button
          onClick={() => {
            onApply();
            onClose?.();
          }}
        >
          Apply
        </Button>
      </div>
    </ModalContainer>
  );
};

export default InputGroupModal;
