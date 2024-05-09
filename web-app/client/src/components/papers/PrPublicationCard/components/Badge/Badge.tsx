import cn from 'classnames';
import { HTMLProps } from 'react';
import { FCWithChildren } from 'types/react';
import styles from './Badge.module.scss';

interface Props extends HTMLProps<HTMLDivElement> {
  color: string;
}

const Badge: FCWithChildren<Props> = ({
  color,
  children,
  className,
  style,
  ...props
}) => {
  return (
    <div
      className={cn(className, styles.badge)}
      style={{ ...style, backgroundColor: color }}
      {...props}
    >
      {children}
    </div>
  );
};

export default Badge;
