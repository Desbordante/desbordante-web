import _ from 'lodash';
import { Moment } from 'moment';
import moment from 'moment';
import { FC, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import EmailIcon from '@assets/icons/email.svg?component';
import Button from '@components/Button';
import TabLayout from '@components/TabLayout';
import {
  getUsersInfo,
  getUsersInfoVariables,
  getUsersInfo_users_data,
} from '@graphql/operations/queries/__generated__/getUsersInfo';
import { GET_USERS_INFO } from '@graphql/operations/queries/getUsersInfo';
import { formatToRange } from '@utils/formatToRange';
import {
  OrderDirection,
  UsersQueryFilters,
  UsersQueryOrderingParameter,
} from 'types/globalTypes';
import EmailModal from './components/EmailModal';
import UserItem from './components/UserItem';
import styles from './UsersOverview.module.scss';
import ControlledSelect from '@components/Inputs/Select/ControlledSelect';
import { Checkbox, DateTime, Select } from '@components/Inputs';
import { countryNames } from '@constants/countryNames';

export type Filters = {
  country?: string;
  period: [Moment | undefined, Moment | undefined];
  includeDeleted: boolean;
};

const defaultFilters: Filters = {
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

const parameterLabels: Record<UsersQueryOrderingParameter, string> = {
  CREATION_TIME: 'Created',
  STATUS: 'Status',
  COUNTRY: 'Country',
  FULL_NAME: 'Full name',
};

const directionLabels: Record<OrderDirection, string> = {
  ASC: 'Ascending',
  DESC: 'Descending',
};

const parameterOptions = Object.entries(parameterLabels).map(
  ([value, label]) => ({ label, value }),
);

const directionOptions = Object.entries(directionLabels).map(
  ([value, label]) => ({ label, value }),
);

const filtersToApi = (filters: Filters): UsersQueryFilters => ({
  ..._.omit(filters, ['period']),
  registrationTime: formatToRange(filters.period, (value) =>
    value.toISOString(),
  ),
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
          renderModalContent: ({ control, register }) => (
            <>
              <ControlledSelect
                control={control}
                controlName="country"
                label="Country"
                placeholder="Select country"
                className={styles.countrySelector}
                options={countryNames.map(({ emoji, native, name }) => ({
                  label: `${emoji} ${native}`,
                  value: name,
                }))}
              />
              <Controller
                control={control}
                name="period"
                render={({ field: { value, onChange } }) => (
                  <DateTime
                    label="Period"
                    value={value}
                    onChange={onChange}
                    className={styles.periodInput}
                  />
                )}
              />
              <Checkbox
                label="Include deleted"
                {...register('includeDeleted')}
              />
            </>
          ),
        }}
        ordering={{
          defaultValues: defaultOrdering,
          renderModalContent: ({ control }) => (
            <>
              <Controller
                control={control}
                name="parameter"
                render={({ field: { value, onChange } }) => (
                  <Select
                    label="Order by"
                    value={parameterOptions.find(
                      (option) => option.value === value,
                    )}
                    onChange={(option) => onChange(option?.value)}
                    options={parameterOptions}
                  />
                )}
              />
              <Controller
                control={control}
                name="direction"
                render={({ field: { value, onChange } }) => (
                  <Select
                    label="Direction"
                    value={directionOptions.find(
                      (option) => option.value === value,
                    )}
                    onChange={(option) => onChange(option?.value)}
                    options={directionOptions}
                  />
                )}
              />
            </>
          ),
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
