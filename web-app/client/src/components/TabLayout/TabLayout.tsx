import { DocumentNode, useLazyQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { DefaultValues, FormProvider, useForm } from 'react-hook-form';
import { Subscription } from 'react-hook-form/dist/utils/createSubject';
import FilterIcon from '@assets/icons/filter.svg?component';
import OrderingIcon from '@assets/icons/ordering.svg?component';
import Button from '@components/Button';
import { Text } from '@components/Inputs';
import PaginationComponent from '@components/Pagination';
import useFormPersist, { StorageToValues } from '@hooks/useFormPersist';
import { OrderDirection, Pagination } from 'types/globalTypes';
import styles from './TabLayout.module.scss';

type BaseQueryResult<TItem> = {
  data: TItem[] | null;
  total: number;
};

type BaseFilters = {
  searchString?: string;
};

type BaseOrdering<TOrderingParameter extends string = string> = {
  parameter: TOrderingParameter;
  direction: OrderDirection;
};

type BaseQueryVariables<
  TFilters extends BaseFilters,
  TOrdering extends BaseOrdering,
> = {
  props: {
    filters: TFilters;
    ordering: TOrdering;
    pagination: Pagination;
  };
};

type InputModalProps = {
  onClose: () => void;
  onApply: () => void;
};

interface Props<
  TFilters extends BaseFilters,
  TOrdering extends BaseOrdering,
  TQueryResult,
  TQueryVariables extends BaseQueryVariables<object, TOrdering>,
  TItem,
> {
  title?: string;
  query: DocumentNode;
  filters?: {
    defaultValues: DefaultValues<TFilters>;
    valuesToApi?: (values: TFilters) => TQueryVariables['props']['filters'];
    storageToValues?: StorageToValues<TFilters>;
    modal?: FC<InputModalProps>;
  };
  ordering?: {
    defaultValues: DefaultValues<TOrdering>;
    valuesToApi?: (values: TOrdering) => TQueryVariables['props']['ordering'];
    storageToValues?: StorageToValues<TOrdering>;
    modal?: FC<InputModalProps>;
  };
  defaultPageSize?: number;
  getData: (result?: TQueryResult) => BaseQueryResult<TItem> | undefined;
  itemRenderer: (item: TItem) => ReactNode;
  headerAdditionalItems?: ReactNode;
}

const TabLayout = <
  TFilters extends BaseFilters,
  TOrdering extends BaseOrdering,
  TQueryResult,
  TQueryVariables extends BaseQueryVariables<object, TOrdering>,
  TItem,
>({
  title,
  query: queryName,
  filters,
  ordering,
  defaultPageSize = 10,
  getData,
  itemRenderer,
  headerAdditionalItems,
}: Props<TFilters, TOrdering, TQueryResult, TQueryVariables, TItem>) => {
  const router = useRouter();
  const filterMethods = useForm<TFilters>({
    defaultValues: filters?.defaultValues,
  });
  const orderingMethods = useForm<TOrdering>({
    defaultValues: ordering?.defaultValues,
  });
  const paginationMethods = useForm<Pagination>({
    defaultValues: {
      limit: defaultPageSize,
      offset: 0,
    },
  });

  const [isFiltersModalShown, setIsFiltersModalShown] = useState(false);
  const [isOrderingModalShown, setIsOrderingModalShown] = useState(false);

  useFormPersist(`${router.asPath}-filters`, {
    ...filterMethods,
    transformValues: filters?.storageToValues,
  });

  useFormPersist(`${router.asPath}-ordering`, {
    ...orderingMethods,
    transformValues: ordering?.storageToValues,
  });

  const [query, { data: queryResult }] = useLazyQuery<
    TQueryResult,
    TQueryVariables
  >(queryName, {
    fetchPolicy: 'network-only',
  });

  const { data = [], total = 0 } = useMemo(
    () => getData(queryResult) ?? { data: [], total: 0 },
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [queryResult],
  );

  const doQuery = () => {
    const queryProps = {
      filters: filters?.valuesToApi
        ? filters.valuesToApi(filterMethods.watch())
        : filterMethods.watch(),
      ordering: ordering?.valuesToApi
        ? ordering.valuesToApi(orderingMethods.watch())
        : orderingMethods.watch(),
      pagination: paginationMethods.watch(),
    } as TQueryVariables['props'];
    query({
      variables: {
        props: queryProps,
      },
    });
  };

  const filtersValues = filterMethods.watch();
  const pagination = paginationMethods.watch();

  useEffect(() => {
    doQuery();
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [filtersValues.searchString, pagination.limit, pagination.offset]);

  useEffect(() => {
    const subscriptions = [filterMethods, orderingMethods].map(
      (methods) =>
        methods.watch(() => paginationMethods.reset()) as Subscription,
    );

    return () => subscriptions.forEach((s) => s.unsubscribe());
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [filterMethods.watch, orderingMethods.watch, paginationMethods.reset]);

  const currentPage = pagination.offset / pagination.limit + 1;
  const pageCount = total / pagination.limit;
  const isPaginationVisible = pageCount > 1;

  const onPageChange = (newPage: number) => {
    paginationMethods.setValue('offset', (newPage - 1) * pagination.limit);
  };

  return (
    <div className={styles.tabLayout}>
      {title && <h5 className={styles.title}>{title}</h5>}
      <div className={styles.settingsRow}>
        <Text
          size={15}
          label="Search"
          placeholder="Search string or regex"
          {...filterMethods.register('searchString')}
        />
        {filters?.modal && (
          <Button
            variant="secondary"
            icon={<FilterIcon />}
            onClick={() => setIsFiltersModalShown(true)}
          >
            Filters
          </Button>
        )}
        {ordering?.modal && (
          <Button
            variant="secondary"
            icon={<OrderingIcon />}
            onClick={() => setIsOrderingModalShown(true)}
          >
            Ordering
          </Button>
        )}
        {headerAdditionalItems}
      </div>
      <ul className={styles.itemsList}>{data?.map(itemRenderer)}</ul>
      {isPaginationVisible && (
        <PaginationComponent
          current={currentPage}
          count={pageCount}
          onChange={onPageChange}
        />
      )}
      <FormProvider {...filterMethods}>
        {filters?.modal && isFiltersModalShown && (
          <filters.modal
            onClose={() => setIsFiltersModalShown(false)}
            onApply={doQuery}
          />
        )}
      </FormProvider>
      <FormProvider {...orderingMethods}>
        {ordering?.modal && isOrderingModalShown && (
          <ordering.modal
            onClose={() => setIsOrderingModalShown(false)}
            onApply={doQuery}
          />
        )}
      </FormProvider>
    </div>
  );
};

export default TabLayout;
