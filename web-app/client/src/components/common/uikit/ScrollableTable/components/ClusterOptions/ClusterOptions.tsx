import cn from 'classnames';
import { Dispatch, FC, SetStateAction, useState } from 'react';
import ThreeDotsIcon from '@assets/icons/three-dots.svg?component';
import Button from '@components/common/uikit/Button';
import { Checkbox } from '@components/common/uikit/Inputs';
import styles from './ClusterOptions.module.scss';

interface Props {
  isSorted: boolean;
  setIsSorted: Dispatch<SetStateAction<boolean>>;
  isSquashed: boolean;
  setIsSquashed: Dispatch<SetStateAction<boolean>>;
}

const ClusterOptions: FC<Props> = ({
  isSorted,
  setIsSorted,
  isSquashed,
  setIsSquashed,
}) => {
  const [isDropdownOpened, setIsDropdownOpened] = useState(false);

  return (
    <div className={styles.dropdownContainer}>
      <Button
        variant="secondary"
        size="sm"
        icon={<ThreeDotsIcon />}
        onClick={() => setIsDropdownOpened((prev) => !prev)}
      />
      <div className={cn(styles.dropdown, !isDropdownOpened && styles.hidden)}>
        <Checkbox
          variant="simple"
          label="Squashed"
          checked={isSquashed}
          onChange={() => setIsSquashed((prev) => !prev)}
        />
        <Checkbox
          variant="simple"
          label="Sorted"
          checked={isSorted}
          onChange={() => setIsSorted((prev) => !prev)}
        />
      </div>
    </div>
  );
};

export default ClusterOptions;
