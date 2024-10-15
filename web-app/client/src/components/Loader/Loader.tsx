import cn from 'classnames';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { FC, useEffect, useState } from 'react';
import Icon, { IconName } from '@components/Icon';
import { approximateAlgorithms } from '@constants/options';
import { primitivePathnames } from '@constants/primitiveReportPathnames';
import useTaskState from '@hooks/useTaskState';
import getTaskStatusData from '@utils/getTaskStatusData';
import { PrimitiveType } from 'types/globalTypes';
import styles from './Loader.module.scss';

const Loader: FC = () => {
  const router = useRouter();
  const { data, error } = useTaskState();
  const [title, setTitle] = useState<string>('');
  const status = getTaskStatusData(error, data.state);

  useEffect(() => {
    const { state, type, algorithmName } = data;

    if (type && algorithmName) {
      setTitle(`${type} + ${algorithmName}`);
      if (approximateAlgorithms.includes(algorithmName) || type === 'TypoFD') {
        setTitle(`Discovery approximate functional dependencies is processing`);
      } else if (type === 'MFD') {
        setTitle(`Verification metric dependency is processing`);
      } else {
        setTitle(`Discovery functional dependencies is processing`);
      }
    }

    if (
      state &&
      'processStatus' in state &&
      state.processStatus === 'COMPLETED' &&
      type !== ''
    ) {
      setTimeout(() => {
        void router.replace({
          pathname: primitivePathnames[type as PrimitiveType],
          query: {
            taskID: data.taskID,
          },
        });
      }, 500);
    }
  }, [data, router]);

  const icon = status.isAnimated ? (
    <video
      autoPlay
      muted
      loop
      width={70}
      height={76}
      data-testid="animated-icon"
    >
      <source src={status.icon} type="video/webm" />
    </video>
  ) : (
    <Icon name={status.icon as IconName} size={76} {...status.iconProps} />
  );
  return (
    <>
      <NextSeo title={title} />
      <div className={styles.container}>
        {icon}
        <div className={styles.text}>
          <h6>
            Task status:
            <span className={cn(styles[status.className], styles.status)}>
              {' '}
              {status.label}
            </span>
          </h6>
          <p className={styles.description}>{status.description}</p>
        </div>
      </div>
    </>
  );
};
export default Loader;
