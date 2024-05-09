import { ComponentType } from 'react';
import { OptionProps } from 'react-select';
import { Badge } from '@components/common/uikit/FileStats/Badge';
import { InputPropsBase } from '@components/common/uikit/Inputs';
import { Option as CustomOption } from '@components/common/uikit/Inputs/Select/customComponents';
import { ColumnOption } from 'types/fileStats';
import styles from '../StatsTab.module.scss';

export const Option: ComponentType<OptionProps & InputPropsBase> = ({
  children,
  ...props
}) => {
  const option = props.data as ColumnOption;

  return (
    <CustomOption {...props}>
      <div className={styles.option}>
        {children}
        {option.type && <Badge mode="secondary">{option.type}</Badge>}
        {option.isCategorical && <Badge>Categorical</Badge>}
      </div>
    </CustomOption>
  );
};
