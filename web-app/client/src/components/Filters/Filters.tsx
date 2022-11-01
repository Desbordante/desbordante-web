import { useEffect } from 'react';
import _ from 'lodash';
import {
  FDSortBy,
  CFDSortBy,
  ARSortBy,
  OrderBy,
  PrimitiveType,
} from 'types/globalTypes';
import { OrderingTitles } from '@constants/titles';
import { useForm } from 'react-hook-form';

export type Sorting = FDSortBy | CFDSortBy | ARSortBy;

export type FiltersFields = {
  ordering: Sorting;
  direction: OrderBy;
  search: string;
  page: number;
  mustContainRhsColIndices: string;
  mustContainLhsColIndices: string;
  showKeys: boolean;
};

const getDefaultOrdering: (primitive: PrimitiveType) => Sorting = (primitive) =>
  _.keys(OrderingTitles[primitive])[0] as Sorting;

export const useFilters = (primitive: PrimitiveType) => {
  const methods = useForm<FiltersFields, keyof FiltersFields>({
    defaultValues: {
      page: 1,
      ordering: getDefaultOrdering(primitive),
      direction: OrderBy.ASC,
      search: '',
      mustContainRhsColIndices: '',
      mustContainLhsColIndices: '',
      showKeys: false,
    },
  });

  useEffect(
    () => methods.setValue('ordering', getDefaultOrdering(primitive)),
    [primitive]
  );

  return methods;
};

export const getSortingParams = (primitive: PrimitiveType) => {
  return {
    [(primitive === PrimitiveType.TypoFD ? PrimitiveType.FD : primitive) +
    'SortBy']: _.keys(OrderingTitles[primitive])[0],
  };
};
