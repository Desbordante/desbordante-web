import { FC } from 'react';
import {
  ToastContainerProps,
  ToastContainer as TostifyToastContainer,
  CloseButtonProps,
} from 'react-toastify';
import styles from './ToastContainer.module.scss';

const CloseButton: FC<CloseButtonProps> = ({ closeToast, ariaLabel }) => (
  <button onClick={closeToast} aria-label={ariaLabel} className={styles.close}>
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.46967 3.46967C3.76256 3.17678 4.23744 3.17678 4.53033 3.46967L8 6.93934L11.4697 3.46967C11.7626 3.17678 12.2374 3.17678 12.5303 3.46967C12.8232 3.76256 12.8232 4.23744 12.5303 4.53033L9.06066 8L12.5303 11.4697C12.8232 11.7626 12.8232 12.2374 12.5303 12.5303C12.2374 12.8232 11.7626 12.8232 11.4697 12.5303L8 9.06066L4.53033 12.5303C4.23744 12.8232 3.76256 12.8232 3.46967 12.5303C3.17678 12.2374 3.17678 11.7626 3.46967 11.4697L6.93934 8L3.46967 4.53033C3.17678 4.23744 3.17678 3.76256 3.46967 3.46967Z"
        fill="white"
      />
    </svg>
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
