import { FC } from 'react';
import ModalContainer, {
  ModalProps,
} from '@components/common/layout/ModalContainer';
import Button from '@components/common/uikit/Button';
import { useAuthContext } from '@hooks/useAuthContext';
import styles from './AuthSuccessModal.module.scss';

const AuthSuccessModal: FC<ModalProps> = ({ onClose }) => {
  const { user } = useAuthContext();

  return (
    <ModalContainer onClose={onClose} className={styles.authSuccessModal}>
      <h4 className={styles.title}>
        Welcome,{' '}
        <span className={styles.userName}>{user?.name || 'Anonymous'}</span>
      </h4>
      <p className={styles.subtitle}>You may now use all standard features.</p>
      <Button
        variant="primary"
        onClick={onClose}
        className={styles.closeButton}
      >
        Close
      </Button>
    </ModalContainer>
  );
};

export default AuthSuccessModal;
