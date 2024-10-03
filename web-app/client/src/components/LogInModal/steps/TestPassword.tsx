import { FC } from 'react';
import { useForm } from 'react-hook-form';
import isStrongPassword from 'validator/lib/isStrongPassword';
import Button from '@components/Button';
import { Text } from '@components/Inputs';
import { passwordTooltip } from '@components/SignUpModal/steps/CoreInfo';
import styles from '../LogInModal.module.scss';

type Inputs = {
  password: string;
};

const defaultValues: Inputs = {
  password: '',
};

export const TestPassword: FC = () => {

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({
    defaultValues,
  });

  const onSubmit = handleSubmit(async (values) => {
    console.log('submit')
  });

  return (
    <>
      <h4 className={styles.title}>Recovery</h4>
      <form onSubmit={onSubmit} className={styles.formContainer}>
        <div className={styles.inputGroup}>
          <Text
            label="Password"
            type="password"
            placeholder="admin1234"
            tooltip={passwordTooltip}
            {...register('password', {
              required: 'Required',
              validate: (value) =>
                isStrongPassword(value) ||
                'The password does not match the pattern (see tooltip)',
            })}
            error={errors.password?.message}
          />
        </div>

        <div className={styles.buttons}>
          <Button variant="primary" type="submit" disabled={isSubmitting} role='submit'>
            Update Password
          </Button>
        </div>
      </form>
    </>
  );
};
