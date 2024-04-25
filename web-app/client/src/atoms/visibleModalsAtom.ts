import { atom } from 'jotai';
import { Dispatch, ReactElement, SetStateAction } from 'react';

type ModalEntry = {
  callerId: string;
  node: ReactElement;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

const visibleModalsAtom = atom<ModalEntry[]>([]);

export default visibleModalsAtom;
