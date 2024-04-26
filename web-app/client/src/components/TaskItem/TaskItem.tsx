import humanizeDuration from 'humanize-duration';
import moment from 'moment';
import Link from 'next/link';
import { FC, ReactNode } from 'react';
import CompletedIcon from '@assets/icons/check-fill.svg?component';
import Logo from '@assets/icons/desbordante.svg?component';
import ResourceLimitIcon from '@assets/icons/resources-limit.svg?component';
import ServerErrorIcon from '@assets/icons/server-error.svg?component';
import QueueIcon from '@assets/icons/users-queue.svg?component';
import Button from '@components/Button';
import colors from '@constants/colors';
import primitiveInfo from '@constants/primitiveInfoType';
import {
  getTasksInfo_tasksInfo_data,
  getTasksInfo_tasksInfo_data_state,
} from '@graphql/operations/queries/__generated__/getTasksInfo';
import { showError, showSuccess } from '@utils/toasts';
import {
  MainPrimitiveType,
  PrimitiveType,
  TaskProcessStatusType,
} from 'types/globalTypes';
import styles from './TaskItem.module.scss';

const getIcon = (state: getTasksInfo_tasksInfo_data_state): ReactNode => {
  const props = {
    className: styles.statusIcon,
  };

  if (state.__typename === 'InternalServerTaskError') {
    return <ServerErrorIcon {...props} />;
  }

  if (state.__typename === 'ResourceLimitTaskError') {
    return <ResourceLimitIcon {...props} />;
  }

  if (state.__typename !== 'TaskState') {
    throw new Error('Wrong typename');
  }

  switch (state.processStatus) {
    case TaskProcessStatusType.ADDED_TO_THE_TASK_QUEUE:
    case TaskProcessStatusType.ADDING_TO_DB:
      return <QueueIcon {...props} />;
    case TaskProcessStatusType.IN_PROCESS:
      return <Logo {...props} color={colors.primary[100]} />;
    case TaskProcessStatusType.COMPLETED:
      return <CompletedIcon {...props} />;
  }
};

const getStatus = (state: getTasksInfo_tasksInfo_data_state): ReactNode => {
  if (state.__typename === 'InternalServerTaskError') {
    return <span className={styles.error}>Internal server error</span>;
  }

  if (state.__typename === 'ResourceLimitTaskError') {
    return <span className={styles.error}>Resource limit reached</span>;
  }

  if (state.__typename !== 'TaskState') {
    throw new Error('Wrong typename');
  }

  switch (state.processStatus) {
    case TaskProcessStatusType.ADDED_TO_THE_TASK_QUEUE:
    case TaskProcessStatusType.ADDING_TO_DB:
      return <span className={styles.info}>Queued</span>;
    case TaskProcessStatusType.IN_PROCESS:
      return (
        <>
          <span className={styles.primary}>
            Phase {state.currentPhase}/{state.maxPhase}:
          </span>{' '}
          {state.phaseName}
        </>
      );
    case TaskProcessStatusType.COMPLETED:
      return (
        <>
          <span className={styles.success}>Completed</span> in{' '}
          {state.elapsedTime !== null && (
            <span title={`${state.elapsedTime} ms`}>
              {humanizeDuration(state.elapsedTime, {
                round: true,
              })}
            </span>
          )}
        </>
      );
  }
};

const getPrimitiveTypeLabel = (primitive: PrimitiveType) =>
  primitiveInfo[primitive as unknown as MainPrimitiveType]?.label;

interface Props {
  data: getTasksInfo_tasksInfo_data;
  displayUserName?: boolean;
}

const TaskItem: FC<Props> = ({
  data: { state, data, taskID, dataset },
  displayUserName = false,
}) => {
  const handleCopy = () => {
    navigator.clipboard
      .writeText(`${location.origin}/reports?taskID=${taskID}`)
      .then(() => {
        showSuccess('Task URL was copied to your clipboard');
      })
      .catch(() => {
        showError('Could not copy cite to clipboard');
      });
  };

  return (
    <li className={styles.taskItem}>
      {getIcon(state)}
      <div className={styles.middle}>
        <div className={styles.top}>
          {dataset?.originalFileName && (
            <Link
              href={`/reports?taskID=${taskID}`}
              className={styles.fileName}
              title={dataset.originalFileName}
            >
              {dataset.originalFileName}
            </Link>
          )}
          <div className={styles.primitiveType}>
            {getPrimitiveTypeLabel(data.baseConfig.type)}
          </div>
          <div className={styles.algorithmName}>
            {data.baseConfig.algorithmName}
          </div>
        </div>
        <div className={styles.bottom}>
          <div className={styles.status}>{getStatus(state)}</div>
          <div className={styles.createdAt}>
            {state.__typename === 'TaskState' &&
              moment(+state.createdAt).format('[Created] L LT')}
          </div>
          {displayUserName && (
            <div className={styles.user}>
              {state.__typename === 'TaskState' &&
                (state.user?.fullName ?? 'Anonymous')}
            </div>
          )}
        </div>
      </div>
      <Button variant="secondary" size="sm" onClick={handleCopy}>
        Copy URL
      </Button>
    </li>
  );
};

export default TaskItem;
