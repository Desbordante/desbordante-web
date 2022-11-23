import React, { FC } from 'react';
import Button from '@components/Button';
import ModalContainer, { ModalProps } from '@components/ModalContainer';
import { useAuthContext } from '@hooks/useAuthContext';
import styles from './AuthSuccessModal.module.scss';

const AuthSuccessModal: FC<ModalProps> = ({ onClose }) => {
  const { user } = useAuthContext();

  return (
    <ModalContainer onClose={onClose}>
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
