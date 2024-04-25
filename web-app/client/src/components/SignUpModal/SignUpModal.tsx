import AuthSuccessModal from '@components/AuthSuccessModal';
import { useAuthContext } from '@hooks/useAuthContext';
import React, { FC, useState } from 'react';
import ModalContainer, { ModalProps } from '../ModalContainer';
import CoreInfo from './steps/CoreInfo';
import EmailVerification from './steps/EmailVerification';

const SignUpModal: FC<ModalProps> = ({ isOpen, setIsOpen }) => {
  const { user } = useAuthContext();

  const [stage, setStage] = useState(user?.id && !user?.isVerified ? 2 : 1);
  const [isOpenSuccessVerified, setIsOpenSuccessVerified] = useState(false);

  const goToNextStage = () => setStage((prev) => prev + 1);
  const onSuccess = () => {
    setIsOpen(false);
    setIsOpenSuccessVerified(true);
  };
  const onCloseSignUp = () => setIsOpen(false);
  const onCloseSuccessVerified = () => setIsOpenSuccessVerified(false);
  console.log(stage, isOpen);

  return (
    <>
      <ModalContainer
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onClose={onCloseSignUp}
      >
        {stage === 1 && <CoreInfo onSuccess={goToNextStage} />}
        {stage === 2 && <EmailVerification onSuccess={onSuccess} />}
      </ModalContainer>
      <AuthSuccessModal
        isOpen={isOpenSuccessVerified}
        setIsOpen={setIsOpenSuccessVerified}
        onClose={onCloseSuccessVerified}
      />
    </>
  );
};

export default SignUpModal;
