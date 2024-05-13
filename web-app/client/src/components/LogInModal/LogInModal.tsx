import { FC, useEffect, useState } from 'react';
import useModal from '@hooks/useModal';
import ModalContainer, { ModalProps } from '../ModalContainer';
import Code from './steps/Code';
import Email from './steps/Email';
import LogIn from './steps/LogIn';
import Password from './steps/Password';
import AuthSuccessModal from '@components/AuthSuccessModal';

const LogInModal: FC<ModalProps> = ({ isOpen, setIsOpen }) => {
  const [stage, setStage] = useState(1);
  const [email, setEmail] = useState('');
  const [isOpenPasswordChanged, setIsOpenPasswordChanged] = useState(false);

  const goToNextStage = () => setStage((prev) => prev + 1);
  const onSuccess = () => {
    setIsOpen(false);
    setIsOpenPasswordChanged(true);
  };
  const onClose = () => {
    setIsOpen(false);
  };
  

  useEffect(() => setStage(1), [isOpen]);

  return (
    <>
      <ModalContainer isOpen={isOpen} setIsOpen={setIsOpen} onClose={onClose}>
        {stage === 1 && (
          <LogIn onSuccess={onSuccess} onRecovery={goToNextStage} />
        )}
        {stage === 2 && (
          <Email email={email} setEmail={setEmail} onSuccess={goToNextStage} />
        )}
        {stage === 3 && <Code email={email} onSuccess={goToNextStage} />}
        {stage === 4 && <Password email={email} onSuccess={onSuccess} />}
      </ModalContainer>
      <AuthSuccessModal
        isOpen={isOpenPasswordChanged}
        setIsOpen={setIsOpenPasswordChanged}
      />
    </>
  );
};

export default LogInModal;
