import { useAtom } from 'jotai';
import { ComponentProps, useCallback, useId, useMemo, useState } from 'react';
import visibleModalsAtom from '@atoms/visibleModalsAtom';
import modals from '@constants/modals';

type Modals = typeof modals;
type ModalName = keyof Modals;
type OpenModalOptions = {
  replace: boolean;
};

const defaultOpenModalOptions: OpenModalOptions = {
  replace: true,
};

const useModal = <T extends ModalName>(name: T) => {
  const [visibleModals, setVisibleModals] = useAtom(visibleModalsAtom);
  const [isOpen, setIsOpen] = useState(true);
  const callerId = useId();
  const Modal = useMemo(() => modals[name], [name]);

  const close = useCallback(() => {
    setVisibleModals((prev) =>
      prev.filter((modal) => modal.callerId !== callerId),
    );
  }, [callerId, setVisibleModals]);

  const defaultModalProps = useMemo(
    () => ({
      onClose: close,
      isOpen: visibleModals,
      setIsOpen: setVisibleModals,
    }),
    [close, visibleModals, setVisibleModals],
  );

  const open = useCallback(
    (
      data: ComponentProps<Modals[T]>,
      { replace } = defaultOpenModalOptions,
    ) => {
      const persist = replace ? visibleModals.slice(1) : visibleModals;
      setVisibleModals(
        persist.concat({
          callerId,
          node: <Modal {...defaultModalProps} {...data} key={callerId} />,
          isOpen,
          setIsOpen,
        }),
      );
    },
    [
      Modal,
      callerId,
      defaultModalProps,
      setVisibleModals,
      visibleModals,
      isOpen,
    ],
  );

  const closeAll = useCallback(() => {
    setVisibleModals([]);
  }, [setVisibleModals]);

  return { open, close, closeAll };
};

export default useModal;
