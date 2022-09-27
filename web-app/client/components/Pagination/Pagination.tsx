import Image from "next/image";
import { FC } from "react";
import _ from "lodash";
import styles from "./Pagination.module.scss";
import arrowRight from "@assets/icons/arrow-right.svg";
import classNames from "classnames";

type Props = {
  count: number;
  current: number;
};

const Pagination: FC<Props> = ({ current, count }) => {
  return (
    <div className={styles.container}>
      <div className={classNames(styles.button, styles.left)}>
        <Image src={arrowRight} width={16} height={16} />
      </div>
      {current !== 1 && <div className={styles.page}>{1}</div>}
      {current > 4 && <div className={styles.page}>...</div>}

      {current - 2 > 1 && <div className={styles.page}>{current - 2}</div>}
      {current - 1 > 1 && <div className={styles.page}>{current - 1}</div>}

      <div className={classNames(styles.page, styles.active)}>{current}</div>

      {current + 1 < count && <div className={styles.page}>{current + 1}</div>}
      {current + 2 < count && <div className={styles.page}>{current + 2}</div>}

      {current < count - 3 && <div className={styles.page}>...</div>}

      {current !== count && <div className={styles.page}>{count}</div>}
      <div className={styles.button}>
        <Image src={arrowRight} width={16} height={16} />
      </div>
    </div>
  );
};

export default Pagination;
