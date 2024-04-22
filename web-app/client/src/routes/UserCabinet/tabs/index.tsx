import dynamic from 'next/dynamic';
import { ComponentType, ReactNode } from 'react';
import ChartIcon from '@assets/icons/chart.svg?component';
import FileIcon from '@assets/icons/file.svg?component';
import GearIcon from '@assets/icons/gear.svg?component';
import UserIcon from '@assets/icons/user.svg?component';

export type TabConfig = {
  pathname: string;
  label: string;
  icon: ReactNode;
  component: ComponentType;
};

const OverviewComponent = dynamic(() => import('./Overview'), {
  ssr: false,
});

const AccountSettings = dynamic(() => import('./AccountSettings'), {
  ssr: false,
});

const UploadedFiles = dynamic(() => import('./UploadedFiles'), {
  ssr: false,
});

const Tasks = dynamic(() => import('./Tasks'), {
  ssr: false,
});

const tabs: TabConfig[] = [
  {
    pathname: 'overview',
    label: 'Overview',
    icon: <ChartIcon />,
    component: OverviewComponent,
  },
  {
    pathname: 'account',
    label: 'Account Settings',
    icon: <UserIcon />,
    component: AccountSettings,
  },
  {
    pathname: 'tasks',
    label: 'Tasks',
    icon: <GearIcon />,
    component: Tasks,
  },
  {
    pathname: 'files',
    label: 'Uploaded Files',
    icon: <FileIcon />,
    component: UploadedFiles,
  },
];

export default tabs;
