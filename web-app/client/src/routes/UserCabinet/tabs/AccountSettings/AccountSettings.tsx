import { useQuery } from '@apollo/client';
import { FC, useState } from 'react';
import Button from '@components/Button';
import { getUser } from '@graphql/operations/queries/__generated__/getUser';
import { GET_USER } from '@graphql/operations/queries/getUser';
import ChangePasswordModal from './components/ChangePasswordModal';
import ProfileForm from './components/ProfileForm';
import styles from './AccountSettings.module.scss';

const AccountSettings: FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data } = useQuery<getUser>(GET_USER, {
    variables: {
      userID: undefined,
    },
  });

  const user = data?.user;

  if (!user) {
    return null;
  }

  return (
    <div className={styles.accountSettingsTab}>
      <h5 className={styles.title}>Account Settings</h5>
      <ProfileForm user={user} />
      <div className={styles.additionalActions}>
        <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
          Change Password
        </Button>
        <Button variant="secondary-danger" disabled>
          Delete Account
        </Button>
      </div>
      {isModalOpen && (
        <ChangePasswordModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default AccountSettings;
