import { FC, useState } from 'react';
import ModalContainer, {
  ModalProps,
} from '@components/common/layout/ModalContainer';
import useModal from '@hooks/useModal';
import Code from './steps/Code';
import Email from './steps/Email';
import LogIn from './steps/LogIn';
import Password from './steps/Password';

const LogInModal: FC<ModalProps> = ({ onClose }) => {
  const { open: openAuthSuccessModal } = useModal('AUTH.SUCCESS');
  const [stage, setStage] = useState(1);
  const [email, setEmail] = useState('');

  const goToNextStage = () => setStage((prev) => prev + 1);
  const onSuccess = () => openAuthSuccessModal({});

  return (
    <ModalContainer onClose={onClose}>
      {stage === 1 && (
        <LogIn onSuccess={onSuccess} onRecovery={goToNextStage} />
      )}
      {stage === 2 && (
        <Email email={email} setEmail={setEmail} onSuccess={goToNextStage} />
      )}
      {stage === 3 && <Code email={email} onSuccess={goToNextStage} />}
      {stage === 4 && <Password email={email} onSuccess={onSuccess} />}
    </ModalContainer>
  );
};

export default LogInModal;
