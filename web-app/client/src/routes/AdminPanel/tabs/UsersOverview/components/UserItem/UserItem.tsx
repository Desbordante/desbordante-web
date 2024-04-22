import { countries } from 'countries-list';
import moment from 'moment';
import { FC } from 'react';
import UserIcon from '@assets/icons/user.svg?component';
import Button from '@components/Button';
import { getUsersInfo_users_data } from '@graphql/operations/queries/__generated__/getUsersInfo';
import styles from './UserItem.module.scss';

const countryNames = Object.entries(countries).map(([, country]) => country);

interface Props {
  data: getUsersInfo_users_data;
  onSendEmail: () => void;
}

const UserItem: FC<Props> = ({
  data: { companyOrAffiliation, country, createdAt, fullName, occupation },
  onSendEmail,
}) => {
  const countryEntry = countryNames.find((item) => item.name === country);

  return (
    <li className={styles.userItem}>
      <div className={styles.iconContainer}>
        <UserIcon className={styles.icon} />
      </div>
      <div className={styles.middle}>
        <div className={styles.top}>
          <div className={styles.fileName}>{fullName}</div>
          <div className={styles.fileType}>
            {occupation} at {companyOrAffiliation}
          </div>
        </div>
        <div className={styles.bottom}>
          <div className={styles.country}>
            <span className={styles.flag}>{countryEntry?.emoji}</span>{' '}
            {countryEntry?.name}
          </div>
          <div className={styles.createdAt}>
            {moment(+createdAt).format('[Created] L LT')}
          </div>
        </div>
      </div>
      <Button variant="secondary" size="sm" onClick={onSendEmail}>
        Send email
      </Button>
    </li>
  );
};

export default UserItem;
