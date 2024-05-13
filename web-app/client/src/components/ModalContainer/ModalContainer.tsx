import { Icon } from '@components/IconComponent';

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
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { FCWithChildren } from 'types/react';
import styles from './ModalContainer.module.scss';
import cn from 'classnames';

export interface ModalProps {
  onClose?: () => void;
  className?: string;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const ModalContainer: FCWithChildren<ModalProps> = ({
  onClose = () => null,
  children,
  isOpen,
  setIsOpen,
  className,
}) => {
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalNode(document.getElementById('portals-container-node'));
  }, []);
  const { refs, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
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

  const dismiss = useDismiss(context, { outsidePressEvent: 'mousedown' });
  const role = useRole(context, { role: 'dialog' });

  const { getFloatingProps } = useInteractions([dismiss, role]);
  return (
    <>
      {isOpen && (
        <FloatingPortal root={portalNode}>
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
