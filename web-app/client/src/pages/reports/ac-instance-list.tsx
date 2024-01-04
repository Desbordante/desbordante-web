import OrderingIcon from '@assets/icons/ordering.svg?component';
import ACAtom, { ACAtomDefaultValuesWithParams } from '@atoms/ACTaskAtom';

import ACInstance from '@components/ACInstance';
import Button from '@components/Button';
import { OrderingWindow, useFilters } from '@components/Filters';
import { Text } from '@components/Inputs';
import Pagination from '@components/Pagination/Pagination';
import ReportsLayout from '@components/ReportsLayout';
import { TaskContextProvider } from '@components/TaskContext';
import { Operation } from '@graphql/operations/queries/__generated__/GetMainTaskDeps';

import styles from '@styles/Dependencies.module.scss';
import { useAtom } from 'jotai';
import { ReactElement, useEffect, useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { PrimitiveType } from 'types/globalTypes';
import { NextPageWithLayout } from 'types/pageWithLayout';

import { myData } from './ACFakeData/data4InstanceList';

const ReportsAlgebraicConstraints: NextPageWithLayout = () => {
  const [isOrderingShown, setIsOrderingShown] = useState(false);
  const methods = useFilters(PrimitiveType.AC);
  const { register, setValue: setFilterParam } = methods;
  const [atom, setAtom] = useAtom(ACAtom);

  const shownData = myData;
  const ACs =
    (shownData.taskInfo.data.result &&
      'ACs' in shownData.taskInfo.data.result &&
      shownData.taskInfo.data.result.ACs) ||
    [];
  const operation =
    ('operation' in shownData.taskInfo.data &&
      shownData.taskInfo.data.operation) ||
    Operation.ADDITION;
  const recordsCount =
    shownData?.taskInfo.data.result &&
    'pairsAttributesAmount' in shownData?.taskInfo.data.result &&
    shownData?.taskInfo.data.result.pairsAttributesAmount;

  useEffect(() => {
    setAtom({
      ...ACAtomDefaultValuesWithParams(
        shownData.taskInfo.taskID,
        atom.instanceSelected,
      ),
    });
  }, [atom.instanceSelected, setAtom, shownData.taskInfo.taskID]);

  return (
    <>
      <FormProvider {...methods}>
        {isOrderingShown && (
          <OrderingWindow
            {...{
              setIsOrderingShown,
              primitive: PrimitiveType.AC,
            }}
          />
        )}
      </FormProvider>

      <h5>Instance List</h5>

      <div className={styles.filters}>
        <Text
          label="Search"
          placeholder="Attribute name or regex"
          className={styles.search}
          {...register('search')}
        />
        <div className={styles.buttons}>
          <Button
            variant="secondary"
            size="md"
            icon={<OrderingIcon />}
            onClick={() => setIsOrderingShown(true)}
          >
            Ordering
          </Button>
        </div>
      </div>

      <div className={styles.rows}>
        {ACs.map((value) => {
          const id = `${value.attributes.attribute1} ${value.attributes.attribute2}`;
          return (
            <ACInstance
              key={id}
              id={id}
              attributes={value.attributes}
              operation={operation}
              intervals={value.intervals}
              outliers={value.outliers}
            />
          );
        })}
      </div>

      <div className={styles.pagination}>
        <Pagination
          onChange={(n) => setFilterParam('page', n)}
          current={1}
          count={Math.ceil((recordsCount || 6) / 6)}
        />
      </div>
    </>
  );
};

ReportsAlgebraicConstraints.getLayout = function getLayout(page: ReactElement) {
  return (
    <TaskContextProvider>
      <ReportsLayout>{page}</ReportsLayout>
    </TaskContextProvider>
  );
};

export default ReportsAlgebraicConstraints;
