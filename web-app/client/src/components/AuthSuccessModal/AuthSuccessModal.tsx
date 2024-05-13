import React, { FC } from 'react';
import Button from '@components/Button';
import ModalContainer, { ModalProps } from '@components/ModalContainer';
import { useAuthContext } from '@hooks/useAuthContext';
import styles from './AuthSuccessModal.module.scss';

const AuthSuccessModal: FC<ModalProps> = ({ onClose, isOpen, setIsOpen }) => {
  const { user } = useAuthContext();
  onClose = () => setIsOpen(false);

  return (
    <ModalContainer
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      onClose={onClose}
      className={styles.authSuccessModal}
    >
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
