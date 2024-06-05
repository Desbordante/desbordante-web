import AuthSuccessModal from '@components/AuthSuccessModal';
import { useAuthContext } from '@hooks/useAuthContext';
import React, { FC, useState } from 'react';
import ModalContainer, { ModalProps } from '../ModalContainer';
import CoreInfo from './steps/CoreInfo';
import EmailVerification from './steps/EmailVerification';

const SignUpModal: FC<ModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthContext();

  const [stage, setStage] = useState(user?.id && !user?.isVerified ? 2 : 1);
  const [isOpenSuccessVerified, setIsOpenSuccessVerified] = useState(false);

  const goToNextStage = () => setStage((prev) => prev + 1);
  const onSuccess = () => {
    onClose();
    setIsOpenSuccessVerified(true);
  };
  const onCloseSuccessVerified = () => setIsOpenSuccessVerified(false);

  return (
    <>
      <ModalContainer
        isOpen={isOpen}
        onClose={onClose}
      >
        {stage === 1 && <CoreInfo onSuccess={goToNextStage} />}
        {stage === 2 && <EmailVerification onSuccess={onSuccess} />}
      </ModalContainer>
      <AuthSuccessModal
        isOpen={isOpenSuccessVerified}
        onClose={() => onCloseSuccessVerified}
      />
    </>
  );
};

export default SignUpModal;
