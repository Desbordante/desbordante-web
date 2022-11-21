import classNames from 'classnames';
import {
  BaseHTMLAttributes,
  FC,
  PropsWithChildren,
  ReactElement,
  useState,
} from 'react';
import ArrowDown from '@assets/icons/arrow-down.svg?component';
import styles from './Collapse.module.scss';

interface Props extends PropsWithChildren {
  title: string;
  titleProps: BaseHTMLAttributes<HTMLHeadingElement>;
}

export const Collapse: FC<Props> = ({ title, titleProps, children }) => {
  const [isShown, setIsShown] = useState(true);
  return (
    <>
      <div
        className={classNames(!isShown && styles.collapsed, styles.title)}
        onClick={() => setIsShown((isShown) => !isShown)}
      >
        <h5 {...titleProps}>
          {title} <ArrowDown height={20} width={20} />
        </h5>
      </div>
      {isShown && <div>{children}</div>}
    </>
  );
};
