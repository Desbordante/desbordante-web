import * as React from 'react';
import Image from 'next/image';
import { FC } from 'react';
import _ from 'lodash';
import ReactPaginate from 'react-paginate';
import styles from './Pagination.module.scss';
import arrowRight from '@assets/icons/arrow-right.svg';

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
        nextLabel={<Image src={arrowRight} width={16} height={16} />}
        onPageChange={(e) => onChange(e.selected)}
        pageRangeDisplayed={5}
        pageCount={count}
        previousLabel={<Image src={arrowRight} width={16} height={16} />}
        className={styles.container}
        forcePage={current}
      />
    </div>
  );
};

export default Pagination;
