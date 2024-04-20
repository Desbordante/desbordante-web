import _ from 'lodash';
import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import { MainPrimitiveType } from 'types/globalTypes';

const parsePrimitiveType = (entry: string | string[] | undefined) =>
  typeof entry === 'string' && entry in MainPrimitiveType
    ? (entry as MainPrimitiveType)
    : undefined;

const parseFileId = (entry: string | string[] | undefined) =>
  typeof entry === 'string' ? entry : undefined;

export const useTaskUrlParams = () => {
  const router = useRouter();

  const changeQueryParamValue = useCallback(
    (name: string, newValue: string) =>
      router.replace(
        {
          pathname: router.pathname,
          query: { ...router.query, [name]: newValue },
        },
        undefined,
        { scroll: false },
      ),
    [router],
  );

  const primitive = useMemo(
    () => ({
      value: parsePrimitiveType(router.query.primitive),
      set: (newValue: MainPrimitiveType) =>
        changeQueryParamValue('primitive', newValue),
    }),
    [changeQueryParamValue, router.query.primitive],
  );

  const fileID = useMemo(
    () => ({
      value: parseFileId(router.query.fileID),
      set: (newValue: string) => changeQueryParamValue('fileID', newValue),
    }),
    [changeQueryParamValue, router.query.fileID],
  );

  const config = useMemo(
    () => ({
      value: _.omit(router.query, ['primitive', 'fileID']),
      set: changeQueryParamValue,
    }),
    [changeQueryParamValue, router.query],
  );

  return { primitive, fileID, config };
};
