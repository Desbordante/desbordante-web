import Image from 'next/image';
import * as React from 'react';
import { FC } from 'react';
import ReactPaginate from 'react-paginate';
import arrowRight from '@assets/icons/arrow-right.svg';
import styles from './Pagination.module.scss';

type Props = {
  count: number;
  current: number;
  onChange: (page: number) => void;
};

const Pagination: FC<Props> = ({ current, count, onChange }) => {
  return (
    <div>
      <ReactPaginate
        breakLabel="..."
        nextLabel={
          <Image src={arrowRight} width={16} height={16} alt={'Next element'} />
        }
        onPageChange={(e) => onChange(e.selected + 1)}
        pageRangeDisplayed={5}
        pageCount={count}
        previousLabel={
          <Image
            src={arrowRight}
            width={16}
            height={16}
            alt={'Previous element'}
          />
        }
        className={styles.container}
        forcePage={current - 1}
      />
    </div>
  );
};

export default Pagination;
