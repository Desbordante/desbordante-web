import cn from 'classnames';
import { FC, FormEvent } from 'react';
import { Radio } from '@components/Inputs';
import PrimitiveDescription from '@components/PrimitiveDescription';
import { PrimitiveInfoType } from '@constants/primitiveInfoType';
import styles from './PrimitiveCard.module.scss';

interface Props {
  name: string;
  info: PrimitiveInfoType;
  isSelected?: boolean;
  onChange?: (e: FormEvent<HTMLInputElement>) => void;
}

const PrimitiveCard: FC<Props> = ({ name, info, isSelected, onChange }) => {
  return (
    <li className={styles.primitiveCard}>
      <Radio
        name="primitive"
        className={cn(styles.radio, isSelected && styles.selected)}
        label={info.label}
        value={name}
        checked={isSelected}
        onChange={onChange}
      />
      {isSelected && (
        <PrimitiveDescription className={styles.descriptionBelow} info={info} />
      )}
    </li>
  );
};

export default PrimitiveCard;
