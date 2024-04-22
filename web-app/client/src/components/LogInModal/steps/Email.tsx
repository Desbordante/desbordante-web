import { useMutation } from '@apollo/client';
import { Dispatch, FC, SetStateAction, useEffect } from 'react';

import { useForm } from 'react-hook-form';
import isEmail from 'validator/lib/isEmail';
import Button from '@components/Button';
import {
  issueCodeForPasswordRecovery,
  issueCodeForPasswordRecoveryVariables,
} from '@graphql/operations/mutations/__generated__/issueCodeForPasswordRecovery';
import { ISSUE_CODE_FOR_PASSWORD_RECOVERY } from '@graphql/operations/mutations/issueCodeForPasswordRecovery';
import { Text } from '../../Inputs';
import styles from '../LogInModal.module.scss';

type Inputs = {
  email: string;
};

const defaultValues: Inputs = {
  email: '',
};

interface Props {
  onSuccess: () => void;
  email: string;
  setEmail: Dispatch<SetStateAction<string>>;
}

const Email: FC<Props> = ({ onSuccess, email, setEmail }) => {
  const [issueCode] = useMutation<
    issueCodeForPasswordRecovery,
    issueCodeForPasswordRecoveryVariables
  >(ISSUE_CODE_FOR_PASSWORD_RECOVERY);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({
    defaultValues,
  });

  useEffect(() => {
    reset({ email });
  }, [email, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const response = await issueCode({
      variables: {
        email: values.email,
      },
    });

    if (response.data?.issueCodeForPasswordRecovery) {
      setEmail(values.email);
      onSuccess();
    }
  });

  return (
    <>
      <h4 className={styles.title}>Recovery</h4>
      <form onSubmit={onSubmit} className={styles.formContainer}>
        <div className={styles.inputGroup}>
          <Text
            label="Email"
            type="email"
            placeholder="your.email@example.com"
            {...register('email', {
              required: 'Required',
              validate: (value) => isEmail(value) || 'Invalid email',
            })}
            error={errors.email?.message}
          />
        </div>

        <div className={styles.buttons}>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            Send Verification Code
          </Button>
        </div>
      </form>
    </>
  );
};

export default Email;
