import { ComponentProps, FC } from 'react';
import { Text } from '@components/Inputs';
import styles from './Password.module.scss';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import isStrongPassword from 'validator/lib/isStrongPassword';

const passwordTooltip = (
  <div className={styles.tooltip}>
    The password must contain
    <ul>
      <li>at least 8 characters</li>
      <li>at least 1 uppercase letter</li>
      <li>at least 1 lowercase letter</li>
      <li>at least 1 digit</li>
      <li>at least 1 special character</li>
    </ul>
  </div>
);

const customValidateFunction = (value: string) => {
  return (
    isStrongPassword(value) ||
    'The password does not match the pattern (see tooltip)'
  );
};

type ControlRules<T extends FieldValues> = ComponentProps<
  typeof Controller<T>
>['rules'];

type TextProps = ComponentProps<typeof Text>;

type ControlProps<T extends FieldValues> = {
  controlName: Path<T>;
  control: Control<T>;
  rules?: ControlRules<T>;
};

type PasswordProps<T extends FieldValues> = TextProps &
  ControlProps<T> & {
    needStrengthValidation?: boolean;
  };

const Password = <T extends FieldValues>({
  controlName,
  control,
  rules,
  needStrengthValidation = true,
  ...rest
}: PasswordProps<T>) => {
  let validate;
  if (!needStrengthValidation) validate = rules?.validate;
  else if (typeof rules?.validate === 'object')
    validate = {
      ...rules.validate,
      strongPassword: customValidateFunction,
    };
  else if (typeof rules?.validate === 'function')
    validate = {
      validation: rules?.validate,
      strongPassword: customValidateFunction,
    };
  else if (rules?.validate === undefined) validate = customValidateFunction;

  return (
    <Controller
      name={controlName}
      control={control}
      rules={{
        ...rules,
        validate: validate as any,
      }}
      render={({ field, fieldState }) => (
        <Text
          type="password"
          tooltip={passwordTooltip}
          {...field}
          error={fieldState.error?.message}
          {...rest}
        />
      )}
    />
  );
};

export default Password;
