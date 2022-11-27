import cn from 'classnames';
import { FC } from 'react';
import InfoIcon from '@assets/icons/info.svg?component';
import { PrimitiveInfoType } from '@constants/primitiveInfoType';
import styles from './PrimitiveDescription.module.scss';

interface Props {
  info: PrimitiveInfoType;
  className?: string;
}

const PrimitiveDescription: FC<Props> = ({ className, info }) => (
  <small className={cn(className, styles.description)}>
    <InfoIcon width={16} height={16} /> {info.description}{' '}
    <a href={info.link} target="_blank" rel="noreferrer">
      Learn more...
    </a>
  </small>
);

export default PrimitiveDescription;
