import styles from './Select.module.scss';
import { forwardRef, useEffect, useRef, useState } from 'react';
import {
  autoUpdate,
  size,
  flip,
  useId,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole,
  FloatingFocusManager,
  FloatingPortal,
} from '@floating-ui/react';
import colors from '@constants/colors';

interface ItemProps {
  children: React.ReactNode;
  active: boolean;
}

const data = [
  'Red',
  'Orange',
  'Yellow',
  'Green',
  'Grey',
  'Cyan',
  'Blue',
  'Purple',
  'Pink',
  'Maroon',
  'Black',
  'White',
];

const AutoComplete = ({ options }) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0);
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalNode(document.getElementById('portals-container-node'));
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [selectedIndex]);

  const listRef = useRef<Array<HTMLElement | null>>([]);

  const { refs, floatingStyles, context } = useFloating<HTMLInputElement>({
    whileElementsMounted: autoUpdate,
    open,
    onOpenChange: setOpen,
    middleware: [
      flip({ padding: 10 }),
      size({
        apply({ rects, availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
            maxHeight: `${availableHeight}px`,
          });
        },
        padding: 10,
      }),
    ],
  });

  const role = useRole(context, { role: 'listbox' });
  const dismiss = useDismiss(context);
  const listNav = useListNavigation(context, {
    listRef,
    activeIndex,
    onNavigate: setActiveIndex,
    virtual: true,
    loop: true,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
    [role, dismiss, listNav],
  );

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setInputValue(value);
    setOpen(true);
    if (value) {
      setActiveIndex(0);
    }
  }

  const items = data.filter((item) =>
    item.toLowerCase().startsWith(inputValue.toLowerCase()),
  );

  const filteredItems = options.filter(
    (opt) => opt.toLowerCase().includes(inputValue.toLowerCase()) && opt,
  );

  const getBackgroundColor = (index: number) => {
    if (index === selectedIndex) return colors.primary[10];
    if (index === activeIndex) return colors.primary[5];
    return colors.white[100];
  };

  return (
    <>
      <input
        {...getReferenceProps({
          className: styles.selectInput,
          ref: refs.setReference,
          onChange,
          value: inputValue,
          placeholder: options[0],
          'aria-autocomplete': 'list',
          onKeyDown(event) {
            if (
              event.key === 'Enter' &&
              activeIndex != null &&
              items[activeIndex]
            ) {
              setInputValue(items[activeIndex]);
              setSelectedIndex(activeIndex);
              setActiveIndex(null);
              setOpen(false);
            }
          },
          onFocus() {
            setOpen(true);
            setActiveIndex(0);
          },
        })}
      />
      {open && (
        <FloatingPortal root={portalNode}>
          <FloatingFocusManager
            context={context}
            initialFocus={-1}
            visuallyHiddenDismiss
          >
            <div
              {...getFloatingProps({
                className: styles.dropdown,
                ref: refs.setFloating,
                style: {
                  ...floatingStyles,
                  background: '#eee',
                  color: 'black',
                  overflowY: 'auto',
                },
              })}
            >
              {filteredItems.map((item, index) => (
                <div
                  key={item}
                  {...getItemProps({
                    key: item,
                    ref(node) {
                      listRef.current[index] = node;
                    },
                    onClick() {
                      setInputValue(item);
                      setOpen(false);
                      setSelectedIndex(index);
                      refs.domReference.current?.focus();
                    },
                  })}
                  style={{
                    background: getBackgroundColor(index),
                    padding: 4,
                    cursor: 'default',
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
};

export default AutoComplete;
