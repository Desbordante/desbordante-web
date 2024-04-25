import _ from 'lodash';
import { Moment } from 'moment';
import moment from 'moment';
import { FC, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import EmailIcon from '@assets/icons/email.svg?component';
import Button from '@components/Button';
import TabLayout from '@components/TabLayout';
import {
  getUsersInfo,
  getUsersInfoVariables,
  getUsersInfo_users_data,
} from '@graphql/operations/queries/__generated__/getUsersInfo';
import { GET_USERS_INFO } from '@graphql/operations/queries/getUsersInfo';
import {
  OrderDirection,
  UsersQueryFilters,
  UsersQueryOrderingParameter,
} from 'types/globalTypes';
import EmailModal from './components/EmailModal';
import FiltersModal from './components/FiltersModal';
import OrderingModal from './components/OrderingModal';
import UserItem from './components/UserItem';
import styles from './UsersOverview.module.scss';

export type Filters = {
  searchString?: string;
  country?: string;
  period: [Moment | undefined, Moment | undefined];
  includeDeleted: boolean;
};

const defaultFilters: Filters = {
  searchString: undefined,
  country: undefined,
  period: [undefined, undefined],
  includeDeleted: false,
};

export type Ordering = {
  parameter: UsersQueryOrderingParameter;
  direction: OrderDirection;
};

const defaultOrdering: Ordering = {
  parameter: UsersQueryOrderingParameter.CREATION_TIME,
  direction: OrderDirection.DESC,
};

export type SendMessageData = {
  recepients: 'all' | 'custom';
  to: string[];
  subject: string;
  body: string;
};

const defaultSendMessageValues: SendMessageData = {
  recepients: 'all',
  to: [],
  subject: '',
  body: '',
};

const filtersToApi = (filters: Filters): UsersQueryFilters => ({
  ..._.omit(filters, ['searchString', 'period']),
  fullName: filters.searchString || undefined,
  registrationTime: filters.period.some(Boolean)
    ? {
        from: filters.period[0]?.toISOString() ?? undefined,
        to: filters.period[1]?.toISOString() ?? undefined,
      }
    : undefined,
});

const UsersOverview: FC = () => {
  const sendMessageMethods = useForm({
    defaultValues: defaultSendMessageValues,
  });

  const [isEmailModalShown, setIsEmailModalShown] = useState(false);

  return (
    <>
      <TabLayout<
        Filters,
        Ordering,
        getUsersInfo,
        getUsersInfoVariables,
        getUsersInfo_users_data
      >
        title="Tasks Overview"
        query={GET_USERS_INFO}
        filters={{
          defaultValues: defaultFilters,
          valuesToApi: filtersToApi,
          storageToValues: {
            period: (value) =>
              value.map((v?: string) => (v ? moment(v) : undefined)),
          },
          modal: FiltersModal,
        }}
        ordering={{
          defaultValues: defaultOrdering,
          modal: OrderingModal,
        }}
        getData={(result) => result?.users}
        itemRenderer={(item) => (
          <UserItem
            data={item}
            key={item.userID}
            onSendEmail={() => {
              sendMessageMethods.reset({
                recepients: 'custom',
                to: [item.userID],
              });
              setIsEmailModalShown(true);
            }}
          />
        )}
        headerAdditionalItems={
          <Button
            variant="secondary"
            className={styles.emailButton}
            icon={<EmailIcon />}
            onClick={() => setIsEmailModalShown(true)}
          >
            Send Email
          </Button>
        }
      />
      <FormProvider {...sendMessageMethods}>
        {isEmailModalShown && (
          <EmailModal onClose={() => setIsEmailModalShown(false)} />
        )}
      </FormProvider>
    </>
  );
};

export default UsersOverview;
