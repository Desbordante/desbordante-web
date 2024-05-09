import AuthSuccessModal from '@components/auth/AuthSuccessModal';
import LogInModal from '@components/auth/LogInModal';
import SignUpModal from '@components/auth/SignUpModal';
import FilePropertiesModal from '@components/choose-file/FilePropertiesModal';

const modals = {
  'AUTH.LOG_IN': LogInModal,
  'AUTH.SIGN_UP': SignUpModal,
  'AUTH.SUCCESS': AuthSuccessModal,
  FILE_PROPERTIES: FilePropertiesModal,
} as const;

export default modals;
