import cn from 'classnames';
import { useCallback, useEffect, useRef } from 'react';
import { animated, useSpring } from 'react-spring';
import CloseIcon from '@assets/icons/close.svg?component';
import { FCWithChildren } from 'types/react';
import styles from './ModalContainer.module.scss';

export interface ModalProps {
  onClose?: () => void;
  className?: string;
}

const ModalContainer: FCWithChildren<ModalProps> = ({
  children,
  className,
  onClose = () => null,
}) => {
  const backgroundFadeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const didClickStartOutside = useRef(false);

  const backgroundFadeProps = useSpring({
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
    config: {
      tension: 300,
    },
  });

  const containerProps = useSpring({
    from: {
      opacity: 0,
      transform: 'translate3d(0, 3%, 0)',
    },
    to: [
      {
        opacity: 1,
        transform: 'translate3d(0, 0, 0)',
      },
      {
        transform: 'none',
        immediate: true,
      },
    ],
    config: {
      tension: 300,
    },
  });

  useEffect(() => {
    const isOutside = (element: Element) => {
      if (!backgroundFadeRef.current || !containerRef.current) {
        return false;
      }

      return (
        backgroundFadeRef.current.contains(element) &&
        !containerRef.current.contains(element)
      );
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      didClickStartOutside.current = isOutside(event.target);
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      if (didClickStartOutside.current && isOutside(event.target)) {
        onClose();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('pointerup', handlePointerUp);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [onClose]);

  useEffect(() => {
    const activeElement = document.activeElement;

    if (!(activeElement instanceof HTMLElement)) {
      return;
    }

    activeElement.blur();

    return () => activeElement.focus();
  }, []);

  return (
    <animated.div
      className={styles.backgroundFade}
      style={backgroundFadeProps}
      ref={backgroundFadeRef}
    >
      <animated.div
        className={cn(className, styles.container)}
        style={containerProps}
        ref={containerRef}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className={styles.closeButton}
        >
          <CloseIcon width={24} height={24} />
        </button>
        <>{children}</>
      </animated.div>
    </animated.div>
  );
};

export default ModalContainer;
