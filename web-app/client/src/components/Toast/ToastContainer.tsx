import { FC } from 'react';
import {
  ToastContainerProps,
  ToastContainer as TostifyToastContainer,
  CloseButtonProps,
} from 'react-toastify';
import Cross from '@assets/icons/white-cross.svg?component';
import styles from './ToastContainer.module.scss';

const CloseButton: FC<CloseButtonProps> = ({ closeToast, ariaLabel }) => (
  <button onClick={closeToast} aria-label={ariaLabel} className={styles.close}>
    <Cross />
  </button>
);

export const ToastContainer: FC<ToastContainerProps> = (props) => (
  <TostifyToastContainer
    position="bottom-right"
    draggable={false}
    className={styles.wrapper}
    closeOnClick={false}
    icon={false}
    closeButton={CloseButton}
    {...props}
  />
);
