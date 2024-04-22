import prettyBytes from 'pretty-bytes';
import { FC } from 'react';
// @ts-expect-error no type declarations available
import arc from 'svg-arc';
import colors from '@constants/colors';
import { getUser_user_datasets_data } from '@graphql/operations/queries/__generated__/getUser';
import FileItem from '../FileItem';
import styles from './Files.module.scss';

interface Props {
  files: getUser_user_datasets_data[] | null;
  reservedSpace: number;
  usedSpace: number;
}

const arcProps = {
  x: 128,
  y: 128,
  R: 128,
  r: 104,
  start: -90,
  end: 90,
};

const Files: FC<Props> = ({ files, reservedSpace, usedSpace }) => {
  const percentage = usedSpace / reservedSpace;
  const degreesForUsedSpace = percentage * 180;

  return (
    <section className={styles.filesSection}>
      <div className={styles.top}>
        <svg viewBox="0 0 256 128" className={styles.chart}>
          <path d={arc(arcProps)} fill={colors.black[10]} />
          <path
            d={arc({
              ...arcProps,
              end: -90 + degreesForUsedSpace,
            })}
            fill={colors.primary[100]}
          />
        </svg>
        <div className={styles.stats}>
          <h5>{prettyBytes(usedSpace, { binary: true })}</h5>
          <p>used of {prettyBytes(reservedSpace, { binary: true })}</p>
        </div>
      </div>
      <ul className={styles.files}>
        {files?.map((file) => (
          <FileItem
            data={file}
            percentage={file.fileSize / reservedSpace}
            key={file.fileID}
          />
        ))}
      </ul>
    </section>
  );
};

export default Files;
