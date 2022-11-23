import { useMutation } from '@apollo/client';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import Button from '@components/Button';
import { Text } from '@components/Inputs';
import {
  approveRecoveryCode,
  approveRecoveryCodeVariables,
} from '@graphql/operations/mutations/__generated__/approveRecoveryCode';
import {
  issueCodeForPasswordRecovery,
  issueCodeForPasswordRecoveryVariables,
} from '@graphql/operations/mutations/__generated__/issueCodeForPasswordRecovery';
import { APPROVE_RECOVERY_CODE } from '@graphql/operations/mutations/approveRecoveryCode';
import { ISSUE_CODE_FOR_PASSWORD_RECOVERY } from '@graphql/operations/mutations/issueCodeForPasswordRecovery';
import styles from '../LogInModal.module.scss';

type Inputs = {
  code: string;
};

const defaultValues: Inputs = {
  code: '',
};

interface Props {
  email: string;
  onSuccess: () => void;
}

const Code: FC<Props> = ({ onSuccess, email }) => {
  const [issueCode] = useMutation<
    issueCodeForPasswordRecovery,
    issueCodeForPasswordRecoveryVariables
  >(ISSUE_CODE_FOR_PASSWORD_RECOVERY);
  const [approveCode] = useMutation<
    approveRecoveryCode,
    approveRecoveryCodeVariables
  >(APPROVE_RECOVERY_CODE);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({
    defaultValues,
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await approveCode({
        variables: {
          email,
          codeValue: +values.code,
        },
      });

      if (response.data?.approveRecoveryCode) {
        onSuccess();
      }
    } catch (error) {
      await issueCode({ variables: { email } });
    }
  });

  return (
    <>
      <h4 className={styles.title}>Recovery</h4>
      <form onSubmit={onSubmit} className={styles.formContainer}>
        <div className={styles.inputGroup}>
          <Text
            label="Code"
            type="text"
            placeholder="****"
            maxLength={4}
            {...register('code', {
              required: 'Required',
              validate: (value) =>
                value.length === 4 || 'Must be four characters long',
            })}
            error={errors.code?.message}
          />
        </div>

        <div className={styles.buttons}>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            Verify Email
          </Button>
        </div>
      </form>
    </>
  );
};

export default Code;
