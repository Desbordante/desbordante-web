import Icon from '@components/Icon';
import {
  useFloating,
  FloatingPortal,
  FloatingOverlay,
  FloatingFocusManager,
  useTransitionStyles,
  useDismiss,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { FCWithChildren } from 'types/react';
import styles from './ModalContainer.module.scss';
import cn from 'classnames';
import { portalRoot } from '@constants/portalRoot';

export interface ModalProps {
  onClose: () => void;
  className?: string;
  isOpen: boolean;
}

const ModalContainer: FCWithChildren<ModalProps> = ({
  onClose,
  children,
  isOpen = true,
  className,
}) => {
  const { refs, context } = useFloating({
    open: isOpen,
    onOpenChange: (prop: boolean) => !prop && onClose(),
  });

  const stylesOverlay = useTransitionStyles(context, {
    duration: 300,
    initial: {
      opacity: 0,
    },
  }).styles;

  const stylesDialog = useTransitionStyles(context, {
    duration: 300,
    initial: {
      transform: 'translate3d(0, 3%, 0)',
    },
  }).styles;

  const dismiss = useDismiss(context, { outsidePressEvent: 'click' });
  const role = useRole(context, { role: 'dialog' });

  const { getFloatingProps } = useInteractions([dismiss, role]);
  return (
    <>
      {isOpen && (
        <FloatingPortal root={portalRoot}>
          <FloatingOverlay
            style={stylesOverlay}
            className={styles.dialogOverlay}
            lockScroll
          >
            <FloatingFocusManager context={context}>
              <div
                style={stylesDialog}
                className={cn(styles.dialog, className)}
                ref={refs.setFloating}
                {...getFloatingProps()}
              >
                {children}
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className={styles.closeButton}
                >
                  <Icon name="cross" />
                </button>
              </div>
            </FloatingFocusManager>
          </FloatingOverlay>
        </FloatingPortal>
      )}
    </>
  );
};

export default ModalContainer;
