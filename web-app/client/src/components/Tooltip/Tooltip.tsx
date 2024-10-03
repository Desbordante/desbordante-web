import {
  FloatingPortal,
  autoUpdate,
  offset,
  useFloating,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { useState } from 'react';
import Icon from '@components/Icon';
import colors from '@constants/colors';
import { portalRoot } from '@constants/portalRoot';
import { FCWithChildren } from 'types/react';

import styles from './Tooltip.module.scss';

interface Props {
  position?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

const Tooltip: FCWithChildren<Props> = ({ position = 'top', children }) => {
  const [isHovered, setIsHovered] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isHovered,
    onOpenChange: setIsHovered,
    whileElementsMounted: autoUpdate,
    placement: position,
    middleware: [offset(5)],
  });

  const hover = useHover(context, { move: false });
  const role = useRole(context, { role: 'tooltip' });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    role,
  ]);

  return (
    <>
      <div
        ref={refs.setReference}
        {...getReferenceProps({ className: styles.tooltip })}
      >
        <Icon
          name="info"
          size={16}
          color={colors.primary[100]}
          className={styles.icon}
          role='img'
        />
      </div>

      {isHovered && (
        <FloatingPortal root={portalRoot}>
          <div
            {...getFloatingProps({
              ref: refs.setFloating,
              className: styles.content,
              style: floatingStyles,
            })}
          >
            {children}
          </div>
        </FloatingPortal>
      )}
    </>
  );
};

export default Tooltip;
