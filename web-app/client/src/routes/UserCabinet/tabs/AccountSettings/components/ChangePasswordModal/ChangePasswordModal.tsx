import { useMutation } from '@apollo/client';
import { FC, useId } from 'react';
import { useForm } from 'react-hook-form';
import Button from '@components/Button';
import ModalContainer, { ModalProps } from '@components/ModalContainer';
import {
  changePassword,
  changePasswordVariables,
} from '@graphql/operations/mutations/__generated__/changePassword';
import { CHANGE_PASSWORD } from '@graphql/operations/mutations/changePassword';
import hashPassword from '@utils/hashPassword';
import styles from './ChangePasswordModal.module.scss';
import Password from '@components/Inputs/Password';

type Inputs = {
  oldPassword: string;
  newPassword: string;
  repeatPassword: string;
};

const ChangePasswordModal: FC<ModalProps> = ({ isOpen, onClose }) => {
  const {
    control,
    handleSubmit,
  } = useForm<Inputs>();
  const formId = useId();
  const [changePassword] = useMutation<changePassword, changePasswordVariables>(
    CHANGE_PASSWORD,
  );

  const onSubmit = handleSubmit(async (values) => {
    try {
      await changePassword({
        variables: {
          currentPwdHash: hashPassword(values.oldPassword),
          newPwdHash: hashPassword(values.newPassword),
        },
      });
      location.reload();
    } catch (e) {}
  });

  return (
    <ModalContainer isOpen={isOpen} onClose={onClose} className={styles.changePasswordModal}>
      <h4 className={styles.title}>Change password</h4>
      <form onSubmit={onSubmit} id={formId}>
        <Password
          control={control}
          controlName="oldPassword"
          label="Old password"
          placeholder="admin1234"
          rules={{ required: 'Required' }}
          needStrengthValidation={false}
        />
        <Password
          control={control}
          controlName="newPassword"
          label="New password"
          placeholder="admin1234"
          rules={{ required: 'Required' }}
        />
        <Password
          control={control}
          controlName="repeatPassword"
          label="Repeat password"
          placeholder="admin1234"
          rules={{
            required: 'Required',
            validate: (value, { newPassword }) =>
              value === newPassword || 'Passwords do not match',
          }}
        />
      </form>
      <div className={styles.actions}>
        <Button variant="secondary">Cancel</Button>
        <Button type="submit" form={formId}>
          Update password
        </Button>
      </div>
    </ModalContainer>
  );
};

export default ChangePasswordModal;
