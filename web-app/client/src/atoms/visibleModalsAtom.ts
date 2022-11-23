import { atom } from 'jotai';
import { ReactElement } from 'react';

type ModalEntry = {
  callerId: string;
  node: ReactElement;
};

const visibleModalsAtom = atom<ModalEntry[]>([]);

export default visibleModalsAtom;
