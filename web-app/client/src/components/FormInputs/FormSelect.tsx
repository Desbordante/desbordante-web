import { ReactElement, ForwardRefRenderFunction, forwardRef } from 'react';
import { Props as ReactSelectProps } from 'react-select/dist/declarations/src';
import { InputPropsBase, Select } from '@components/Inputs';
import { FormSelectProps } from 'types/form';

export type Props = InputPropsBase & ReactSelectProps & FormSelectProps;

const FormSelect: ForwardRefRenderFunction<ReactElement, Props> = (
  props,
  ref
) => {
  return <Select ref={ref} {...props} />;
};

export default forwardRef(FormSelect);
