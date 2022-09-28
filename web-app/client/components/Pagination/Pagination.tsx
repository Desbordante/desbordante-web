import Image from "next/image";
import { FC, PropsWithChildren } from "react";
import _ from "lodash";
import styles from "./Pagination.module.scss";
import arrowRight from "@assets/icons/arrow-right.svg";
import classNames from "classnames";

type Props = {
  count: number;
  current: number;
  onChange: (page: number) => void;
};

type PageProps = {
  page: number;
} & PropsWithChildren;

const createPage: (onChange: (page: number) => void) => FC<PageProps> =
  (onChange) =>
  ({ children, page }) =>
    (
      <div onClick={() => onChange(page)} className={styles.page}>
        {children || page}
      </div>
    );

const Pagination: FC<Props> = ({ current, count, onChange }) => {
  const Page = createPage(onChange);
  return (
    <div className={styles.container}>
      <div
        className={classNames(styles.button, styles.left)}
        onClick={() => onChange(Math.max(1, current - 1))}
      >
        <Image src={arrowRight} width={16} height={16} />
      </div>
      {current !== 1 && <Page page={1} />}
      {current > 4 && <div className={styles.page}>...</div>}

      {current - 2 > 1 && <Page page={current - 2} />}
      {current - 1 > 1 && <Page page={current - 1} />}

      <div className={classNames(styles.page, styles.active)}>{current}</div>

      {current + 1 < count && <Page page={current + 1} />}
      {current + 2 < count && <Page page={current + 2} />}

      {current < count - 3 && <div className={styles.page}>...</div>}

      {current !== count && <Page page={count} />}
      <div
        className={styles.button}
        onClick={() => onChange(Math.min(count, current + 1))}
      >
        <Image src={arrowRight} width={16} height={16} />
      </div>
    </div>
  );
};

export default Pagination;
