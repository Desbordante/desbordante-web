import { Icon } from '@components/IconComponent';
import { InputPropsBase } from '@components/Inputs';
import cn from 'classnames';
import { ComponentType } from 'react';
import {
  components,
  ControlProps,
  IndicatorsContainerProps,
  InputProps,
  OptionProps,
  PlaceholderProps,
  SingleValueProps,
  ValueContainerProps,
  NoticeProps,
  MenuProps,
} from 'react-select';
import { Option as OptionType } from 'types/inputs';
import styles from './Select.module.scss';
import { FloatingPortal } from '@floating-ui/react';

const Control: ComponentType<
  ControlProps<OptionType, false> & InputPropsBase
> = ({ children, error, innerRef, innerProps, isFocused }) => (
  <div
    {...innerProps}
    ref={innerRef}
    className={cn(
      styles.control,
      error && styles.error,
      isFocused && styles.focused,
    )}
  >
    {children}
  </div>
);

const ValueContainer: ComponentType<
  ValueContainerProps<OptionType, false> & InputPropsBase
> = ({ children, innerProps }) => (
  <div {...innerProps} className={styles.valueContainer}>
    {children}
  </div>
);

const SingleValue: ComponentType<
  SingleValueProps<OptionType, false> & InputPropsBase
> = ({ children, innerProps }) => (
  <div {...innerProps} className={styles.singleValue}>
    {children}
  </div>
);

const Placeholder: ComponentType<
  PlaceholderProps<OptionType, false> & InputPropsBase
> = ({ children, innerProps }) => (
  <div className={styles.placeholder} {...innerProps}>
    {children}
  </div>
);

const Input: ComponentType<InputProps<OptionType, false> & InputPropsBase> = (
  inputProps,
) => (
  <div className={cn(styles.input, inputProps.value && styles.hasValue)}>
    <components.Input {...inputProps} />
  </div>
);

const IndicatorsContainer: ComponentType<
  IndicatorsContainerProps<OptionType, false> & InputPropsBase
> = ({ innerProps }) => (
  <div className={styles.indicatorsContainer} {...innerProps}>
    <Icon name="angle" />
  </div>
);

const Menu: ComponentType<MenuProps<OptionType, false> & InputPropsBase> = (
  innerProps,
) => (
    <FloatingPortal>
      <components.Menu {...innerProps}></components.Menu>
    </FloatingPortal>
  );

export const Option: ComponentType<
  OptionProps<OptionType, false> & InputPropsBase
> = ({ innerProps, innerRef, children, isFocused, isSelected }) => (
  <div
    className={cn(
      styles.option,
      isFocused && styles.focused,
      isSelected && styles.selected,
    )}
    {...innerProps}
    ref={innerRef}
  >
    {children}
  </div>
);

const NoOptionsMessage: ComponentType<
  NoticeProps<OptionType, false> & InputPropsBase
> = ({ innerProps, children }) => (
  <div className={cn(styles.option, styles.noOptionsMessage)} {...innerProps}>
    {children}
  </div>
);

const customComponents = {
  Control,
  ValueContainer,
  SingleValue,
  Placeholder,
  Input,
  IndicatorsContainer,
  Option,
  NoOptionsMessage,
};

export default customComponents;
