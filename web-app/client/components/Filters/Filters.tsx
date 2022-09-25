import Button from '@components/Button';
import PopupWindowContainer from '@components/PopupWindowContainer';
import React, {
  useState,
  FC,
  useEffect,
  useCallback,
  ReactElement,
} from 'react';
import { Checkbox, Select, Text } from '@components/Inputs';
import _ from 'lodash';
import {
  FDSortBy,
  CFDSortBy,
  ARSortBy,
  OrderBy,
  PrimitiveType,
} from 'types/globalTypes';
import styles from './Filters.module.scss';
import { OrderingTitles } from '@constants/titles';
import { title } from 'process';

export type Sorting = FDSortBy | CFDSortBy | ARSortBy;

export type FiltersFields = {
  ordering: Sorting;
  direction: OrderBy;
  search: string;
  page: number;
  mustContainRhsColIndices: string;
  mustContainLhsColIndices: string;
};

const getDefaultOrdering = (primitive: PrimitiveType) =>
  _.keys(OrderingTitles[primitive])[0] as Sorting;

export const useFilters = (primitive: PrimitiveType) => {
  const [fields, setFields] = useState<FiltersFields>({
    page: 1,
    ordering: getDefaultOrdering(primitive),
    direction: OrderBy.ASC,
    search: '',
    mustContainRhsColIndices: '',
    mustContainLhsColIndices: '',
  });

  const setFilterField = (
    field: keyof FiltersFields,
    fieldValue: string | number
  ) => {
    setFields({ ...fields, [field]: fieldValue });
  };

  const setFilterFields = (newFields: Partial<FiltersFields>) => {
    setFields({ ...fields, ...newFields });
  };

  useEffect(
    () => setFilterField('ordering', getDefaultOrdering(primitive)),
    [primitive]
  );

  return { setFilterField, setFilterFields, fields };
};

export const getSortingParams = (primitive: PrimitiveType) => {
  return {
    [(primitive === PrimitiveType.TypoFD ? PrimitiveType.FD : primitive) +
    'SortBy']: _.keys(OrderingTitles[primitive])[0],
  };
};

type OrderingProps = {
  setIsOrderingShown: (arg: boolean) => void;
  primitive: PrimitiveType;
  sortingParams: { direction: OrderBy; ordering: Sorting };
  setSortingParams: (sorting: Sorting, ordering: OrderBy) => void;
};

export const OrderingWindow: FC<OrderingProps> = ({
  setIsOrderingShown,
  primitive,
  sortingParams: { ordering, direction },
  setSortingParams,
}) => {
  const [selectedOrdering, selectOrdering] = useState(ordering);
  const [selectedDirection, selectDirection] = useState(direction);

  const OrderingOptions = _.mapValues(
    OrderingTitles[primitive],
    (k: string, v: string) => ({
      label: k,
      value: v,
    })
  );

  const DirectionOptions = {
    [OrderBy.ASC]: { value: OrderBy.ASC, label: 'Ascending' },
    [OrderBy.DESC]: { value: OrderBy.DESC, label: 'Descending' },
  };

  return (
    <>
      <PopupWindowContainer onOutsideClick={() => setIsOrderingShown(false)}>
        <div className={styles.container}>
          <h4>Choose ordering</h4>
          <Select
            label="Order by"
            options={_.values(OrderingOptions)}
            value={OrderingOptions[selectedOrdering]}
            onChange={(e: any) => selectOrdering(e?.value)}
          />

          <Select
            label="Direction"
            options={_.values(DirectionOptions)}
            value={DirectionOptions[selectedDirection]}
            onChange={(e: any) => selectDirection(e?.value)}
          />

          <div className={styles.footer}>
            <Button
              variant="secondary"
              onClick={() => {
                setIsOrderingShown(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setSortingParams(selectedOrdering, selectedDirection);
                setIsOrderingShown(false);
              }}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopupWindowContainer>
    </>
  );
};

type FilteringProps = {
  setIsFilteringShown: (arg: boolean) => void;
  mustContainRhsColIndices: string;
  mustContainLhsColIndices: string;
  setMustContainRhsColIndices: (arg: string) => void;
  setMustContainLhsColIndices: (arg: string) => void;
};

export const FilteringWindow: FC<FilteringProps> = ({
  setIsFilteringShown,
  mustContainRhsColIndices,
  mustContainLhsColIndices,
  setMustContainRhsColIndices,
  setMustContainLhsColIndices,
}) => {
  const validRhs =
    !mustContainRhsColIndices ||
    mustContainRhsColIndices
      .split(',')
      .filter((s) => Number.isNaN(Number.parseFloat(s))).length === 0;

  const validLhs =
    !mustContainLhsColIndices ||
    mustContainLhsColIndices
      .split(',')
      .filter((s) => Number.isNaN(Number.parseFloat(s))).length === 0;

  return (
    <>
      <PopupWindowContainer
        onOutsideClick={() =>
          validLhs && validRhs && setIsFilteringShown(false)
        }
      >
        <div className={styles.container}>
          <h5>Choose filters</h5>
          <Text
            error={
              !validRhs
                ? 'Please enter valid comma-separated numbers'
                : undefined
            }
            placeholder="must Contain Rhs Col Indices"
            value={mustContainRhsColIndices}
            onChange={(e) => setMustContainRhsColIndices(e.currentTarget.value)}
          />
          <Text
            error={
              !validLhs
                ? 'Please enter valid comma-separated numbers'
                : undefined
            }
            placeholder="must Contain Lhs Col Indices"
            value={mustContainLhsColIndices}
            onChange={(e) => setMustContainLhsColIndices(e.currentTarget.value)}
          />
        </div>
      </PopupWindowContainer>
    </>
  );
};
