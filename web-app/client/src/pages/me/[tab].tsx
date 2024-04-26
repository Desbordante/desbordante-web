import { useRouter } from 'next/router';
import { useEffect } from 'react';
import UserIcon from '@assets/icons/user.svg?component';
import TabsLayout from '@components/TabsLayout';
import { useAuthContext } from '@hooks/useAuthContext';
import styles from '@styles/Me.module.scss';
import tabs from 'src/routes/UserCabinet/tabs';
import { NextPageWithLayout } from 'types/pageWithLayout';

const UserCabinet: NextPageWithLayout = () => {
  const router = useRouter();
  const { user } = useAuthContext();

  useEffect(() => {
    if (user === null) {
      router.push('/');
    }
  }, [router, user]);

  if (!user) {
    return null;
  }

  const currentTab =
    tabs.find((tab) => router.query.tab === tab.pathname) ?? tabs[0];

  const Component = currentTab.component;

  return (
    <TabsLayout
      tabs={tabs}
      selectedTab={currentTab.pathname}
      onTabSelect={(pathname) => router.push(`/me/${pathname}`)}
      beforeTabs={
        <div className={styles.beforeMenu}>
          <div className={styles.iconContainer}>
            <div className={styles.iconBackground}>
              <UserIcon className={styles.icon} />
            </div>
          </div>
          <div className={styles.nameContainer}>
            <h5>{user?.name}</h5>
            <small>{user?.email}</small>
          </div>
        </div>
      }
    >
      <Component />
    </TabsLayout>
  );
};

export default UserCabinet;
