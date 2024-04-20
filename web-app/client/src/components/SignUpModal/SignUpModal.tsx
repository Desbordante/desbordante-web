import React, { FC, useCallback, useState } from 'react';
import { useAuthContext } from '@hooks/useAuthContext';
import useModal from '@hooks/useModal';
import ModalContainer, { ModalProps } from '../ModalContainer';
import CoreInfo from './steps/CoreInfo';
import EmailVerification from './steps/EmailVerification';

const SignUpModal: FC<ModalProps> = ({ onClose }) => {
  const { user } = useAuthContext();
  const { open: openAuthSuccessModal } = useModal('AUTH.SUCCESS');

  const [stage, setStage] = useState(user?.id && !user?.isVerified ? 2 : 1);

  const goToNextStage = useCallback(
    () => setStage((prevStage) => prevStage + 1),
    [],
  );
  const onSuccess = useCallback(
    () => openAuthSuccessModal({}),
    [openAuthSuccessModal],
  );

  return (
    <ModalContainer onClose={onClose}>
      {stage === 1 && <CoreInfo onSuccess={goToNextStage} />}
      {stage === 2 && <EmailVerification onSuccess={onSuccess} />}
    </ModalContainer>
  );
};

export default SignUpModal;
