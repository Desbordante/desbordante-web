import { useRouter } from 'next/router';
import { useEffect } from 'react';
import TabsLayout from '@components/TabsLayout';
import { useAuthContext } from '@hooks/useAuthContext';
import tabs from 'src/routes/AdminPanel/tabs';
import { NextPageWithLayout } from 'types/pageWithLayout';

const AdminPanel: NextPageWithLayout = () => {
  const router = useRouter();
  const { user } = useAuthContext();

  useEffect(() => {
    if (user === undefined) {
      return;
    }

    if (user === null || !user.permissions.canViewAdminInfo) {
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
      onTabSelect={(pathname) => router.push(`/admin-panel/${pathname}`)}
    >
      <Component />
    </TabsLayout>
  );
};

export default AdminPanel;
