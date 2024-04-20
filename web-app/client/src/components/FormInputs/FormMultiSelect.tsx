import _ from 'lodash';
import { ControllerRenderProps } from 'react-hook-form/dist/types/controller';
import { Props as ReactSelectProps } from 'react-select/dist/declarations/src';
import { InputPropsBase, MultiSelect } from '@components/Inputs';
import { FormMultiSelectProps } from 'types/form';
import { OptionWithBadges } from 'types/multiSelect';

export type Props = InputPropsBase & ReactSelectProps & FormMultiSelectProps;

type MultiSelectProps = {
  field: ControllerRenderProps;
  props: FormMultiSelectProps;
};

const FormMultiSelect = ({
  field: { onChange, value, ...field },
  props,
}: MultiSelectProps) => {
  return (
    <MultiSelect
      {...field}
      isDisabled={props.disabled}
      isLoading={props.isLoading}
      value={
        value !== undefined
          ? props.options.filter(({ value: element }) =>
              value.includes(element),
            )
          : []
      }
      onChange={(newValues) =>
        onChange(
          (newValues as OptionWithBadges[]).map((element) => element.value),
        )
      }
      {..._.omit(props, ['rules', 'disabled', 'isLoading'])}
    />
  );
};

export default FormMultiSelect;
