import AuthSuccessModal from '@components/AuthSuccessModal';
import LogInModal from '@components/LogInModal';
import SignUpModal from '@components/SignUpModal';

const modals = {
  'AUTH.LOG_IN': LogInModal,
  'AUTH.SIGN_UP': SignUpModal,
  'AUTH.SUCCESS': AuthSuccessModal,
} as const;

export default modals;
