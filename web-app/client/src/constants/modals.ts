import AuthSuccessModal from '@components/AuthSuccessModal';
import FilePropertiesModal from '@components/FilePropertiesModal';
import LogInModal from '@components/LogInModal';
import SignUpModal from '@components/SignUpModal';

const modals = {
  'AUTH.LOG_IN': LogInModal,
  'AUTH.SIGN_UP': SignUpModal,
  'AUTH.SUCCESS': AuthSuccessModal,
  FILE_PROPERTIES: FilePropertiesModal,
} as const;

export default modals;
