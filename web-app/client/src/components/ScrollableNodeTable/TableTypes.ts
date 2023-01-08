import { ReactNode } from 'react';

export type Row = {
  items: ReactNode[];
  globalIndex?: number;
  style?: string;
};

export type ScrollDirection = 'up' | 'down';

export type TableProps = {
  data: Row[];
  header?: string[];
  highlightRowIndices?: number[];
  highlightColumnIndices?: number[];
  hiddenColumnIndices?: number[];
  onScroll?: (direction: ScrollDirection) => void;
  className?: string;
};
