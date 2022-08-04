import {
  forwardRef,
  ForwardRefRenderFunction,
  HTMLInputTypeAttribute,
  HTMLProps,
  ReactNode,
} from 'react';
import typesMap from '@components/Input/types';

export type InputTypes = Extract<HTMLInputTypeAttribute, 'text' | 'checkbox'>;

export interface InputProps extends HTMLProps<HTMLInputElement> {
  type?: InputTypes;
  error?: string;
  label?: string;
  tooltip?: ReactNode;
}

const Input: ForwardRefRenderFunction<HTMLInputElement, InputProps> = (
  { type = 'text', ...props },
  ref
) => {
  const Component = typesMap[type];

  return <Component {...props} ref={ref} />;
};

export default forwardRef(Input);
