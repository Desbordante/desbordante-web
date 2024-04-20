import { useMutation } from '@apollo/client';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import isStrongPassword from 'validator/lib/isStrongPassword';
import Button from '@components/Button';
import { Text } from '@components/Inputs';
import {
  changePassword,
  changePasswordVariables,
} from '@graphql/operations/mutations/__generated__/changePassword';
import { CHANGE_PASSWORD } from '@graphql/operations/mutations/changePassword';
import { useAuthContext } from '@hooks/useAuthContext';
import hashPassword from '@utils/hashPassword';
import styles from '../LogInModal.module.scss';

type Inputs = {
  password: string;
};

const defaultValues: Inputs = {
  password: '',
};

interface Props {
  email: string;
  onSuccess: () => void;
}

const Password: FC<Props> = ({ onSuccess, email }) => {
  const { applyTokens } = useAuthContext();
  const [changePassword] = useMutation<changePassword, changePasswordVariables>(
    CHANGE_PASSWORD,
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({
    defaultValues,
  });

  const onSubmit = handleSubmit(async (values) => {
    const response = await changePassword({
      variables: {
        email,
        newPwdHash: hashPassword(values.password),
      },
    });

    if (response.data?.changePassword.__typename === 'TokenPair') {
      applyTokens(response.data?.changePassword);
      onSuccess();
    }
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
            {...register('password', {
              required: 'Required',
              validate: (value) => isStrongPassword(value) || 'Weak password',
            })}
            error={errors.password?.message}
          />
        </div>

        <div className={styles.buttons}>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            Update Password
          </Button>
        </div>
      </form>
    </>
  );
};

export default Password;
