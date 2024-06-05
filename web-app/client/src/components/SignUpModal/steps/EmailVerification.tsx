import { useMutation } from '@apollo/client';
import { FC, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Button from '@components/Button';
import { Alert } from '@components/FileStats/Alert';
import { Text } from '@components/Inputs';
import {
  approveUserEmail,
  approveUserEmailVariables,
} from '@graphql/operations/mutations/__generated__/approveUserEmail';
import { issueVerificationCode } from '@graphql/operations/mutations/__generated__/issueVerificationCode';
import { APPROVE_USER_EMAIL } from '@graphql/operations/mutations/approveUserEmail';
import { ISSUE_VERIFICATION_CODE } from '@graphql/operations/mutations/issueVerificationCode';
import { useAuthContext } from '@hooks/useAuthContext';
import styles from '../../LogInModal/LogInModal.module.scss';

type Inputs = {
  code: string;
};

const defaultValues: Inputs = {
  code: '',
};

interface Props {
  onSuccess: () => void;
}

const EmailVerification: FC<Props> = ({ onSuccess }) => {
  const { user, applyTokens } = useAuthContext();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({
    defaultValues,
  });

  const [verifyEmail] = useMutation<
    approveUserEmail,
    approveUserEmailVariables
  >(APPROVE_USER_EMAIL);
  const [issueCode] = useMutation<issueVerificationCode>(
    ISSUE_VERIFICATION_CODE,
  );

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await verifyEmail({
        variables: {
          codeValue: +values.code,
        },
      });

      if (response.data?.approveUserEmail) {
        applyTokens(response.data.approveUserEmail);
        onSuccess();
      }
    } catch (error) {
      await issueCode();
    }
  });

  useEffect(() => {
    issueCode();
  }, [issueCode]);

  return (
    <>
      <h4 className={styles.title}>Sign Up</h4>
      <Alert className={styles.alert}>
        We have sent the verification code to {user?.email}
      </Alert>
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

export default EmailVerification;
