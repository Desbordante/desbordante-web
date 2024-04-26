import { DocumentNode, useLazyQuery } from '@apollo/client';
import _ from 'lodash';
import { useRouter } from 'next/router';
import {
  FC,
  FormEventHandler,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  DefaultValues,
  FieldValues,
  FormProvider,
  UseFormReturn,
  useForm,
} from 'react-hook-form';
import { Subscription } from 'react-hook-form/dist/utils/createSubject';
import FilterIcon from '@assets/icons/filter.svg?component';
import OrderingIcon from '@assets/icons/ordering.svg?component';
import Button from '@components/Button';
import { Text } from '@components/Inputs';
import PaginationComponent from '@components/Pagination';
import useFormPersist, { StorageToValues } from '@hooks/useFormPersist';
import { OrderDirection, Pagination } from 'types/globalTypes';
import InputGroupModal from './InputGroupModal';
import styles from './TabLayout.module.scss';

type BaseQueryResult<TItem> = {
  data: TItem[] | null;
  total: number;
};

type BaseOrdering<TOrderingParameter extends string = string> = {
  parameter: TOrderingParameter;
  direction: OrderDirection;
};

type BaseQueryVariables<
  TFilters extends FieldValues,
  TOrdering extends BaseOrdering,
> = {
  props: {
    filters: TFilters;
    ordering: TOrdering;
    pagination: Pagination;
  };
};

type GroupInputProps<
  TQueryVariables extends { props: Record<TName, object> },
  TGroupInputs extends FieldValues,
  TName extends string,
> = {
  defaultValues: DefaultValues<TGroupInputs>;
  valuesToApi?: (values: TGroupInputs) => TQueryVariables['props'][TName];
  storageToValues?: StorageToValues<TGroupInputs>;
  renderModalContent?: (formMethods: UseFormReturn<TGroupInputs>) => ReactNode;
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
  searchStringParameterName?: string;
  filters?: GroupInputProps<TQueryVariables, TFilters, 'filters'>;
  ordering?: GroupInputProps<TQueryVariables, TOrdering, 'ordering'>;
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
  searchStringParameterName = 'searchString',
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

  useFormPersist(`${router.asPath}-filters`, {
    ...filterMethods,
    transformValues: filters?.storageToValues,
  });

  useFormPersist(`${router.asPath}-ordering`, {
    ...orderingMethods,
    transformValues: ordering?.storageToValues,
  });

  const [searchString, setSearchString] = useState('');
  const [isFiltersModalShown, setIsFiltersModalShown] = useState(false);
  const [isOrderingModalShown, setIsOrderingModalShown] = useState(false);

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

  const doQuery = useCallback(() => {
    const queryProps = {
      filters: filters?.valuesToApi
        ? filters.valuesToApi({
            ...filterMethods.watch(),
            [searchStringParameterName]: searchString,
          })
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
  }, [query]);

  const debouncedSendRequest = useMemo(() => {
    return _.debounce(doQuery, 250);
  }, []);

  const handleSearchStringChange: FormEventHandler<HTMLInputElement> = (e) => {
    const { value } = e.currentTarget;

    setSearchString(value);
    debouncedSendRequest();
  };

  const pagination = paginationMethods.watch();

  useEffect(() => {
    doQuery();
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [pagination.limit, pagination.offset]);

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
          value={searchString}
          onChange={handleSearchStringChange}
        />
        {filters?.renderModalContent && (
          <Button
            variant="secondary"
            icon={<FilterIcon />}
            onClick={() => setIsFiltersModalShown(true)}
          >
            Filters
          </Button>
        )}
        {ordering?.renderModalContent && (
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
        {filters?.renderModalContent && isFiltersModalShown && (
          <InputGroupModal
            name="Filters"
            onReset={() => filterMethods.reset(filters.defaultValues)}
            onClose={() => setIsFiltersModalShown(false)}
            onApply={doQuery}
          >
            {filters.renderModalContent(filterMethods)}
          </InputGroupModal>
        )}
      </FormProvider>
      <FormProvider {...orderingMethods}>
        {ordering?.renderModalContent && isOrderingModalShown && (
          <InputGroupModal
            name="Ordering"
            onReset={() => orderingMethods.reset(ordering.defaultValues)}
            onClose={() => setIsOrderingModalShown(false)}
            onApply={doQuery}
          >
            {ordering.renderModalContent(orderingMethods)}
          </InputGroupModal>
        )}
      </FormProvider>
    </div>
  );
};

export default TabLayout;
