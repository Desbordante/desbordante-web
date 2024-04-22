import { useMutation } from '@apollo/client';
import { FC, useId } from 'react';
import { useForm } from 'react-hook-form';
import isStrongPassword from 'validator/lib/isStrongPassword';
import Button from '@components/Button';
import { Text } from '@components/Inputs';
import ModalContainer, { ModalProps } from '@components/ModalContainer';
import {
  changePassword,
  changePasswordVariables,
} from '@graphql/operations/mutations/__generated__/changePassword';
import { CHANGE_PASSWORD } from '@graphql/operations/mutations/changePassword';
import hashPassword from '@utils/hashPassword';
import styles from './ChangePasswordModal.module.scss';

type Inputs = {
  oldPassword: string;
  newPassword: string;
  repeatPassword: string;
};

const ChangePasswordModal: FC<ModalProps> = ({ onClose }) => {
  const {
    register,
    formState: { errors },
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
    <ModalContainer onClose={onClose} className={styles.changePasswordModal}>
      <h4 className={styles.title}>Change password</h4>
      <form onSubmit={onSubmit} id={formId}>
        <Text
          label="Old password"
          type="password"
          placeholder="admin1234"
          {...register('oldPassword', {
            required: 'Required',
          })}
          error={errors.oldPassword?.message}
        />
        <Text
          label="New password"
          type="password"
          placeholder="admin1234"
          {...register('newPassword', {
            required: 'Required',
            validate: (value) => isStrongPassword(value) || 'Weak password',
          })}
          error={errors.newPassword?.message}
        />
        <Text
          label="Repeat password"
          type="password"
          placeholder="admin1234"
          {...register('repeatPassword', {
            required: 'Required',
            validate: {
              isStrong: (value) => isStrongPassword(value) || 'Weak password',
              isSame: (value, { newPassword }) =>
                value === newPassword || 'Passwords do not match',
            },
          })}
          error={errors.repeatPassword?.message}
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
