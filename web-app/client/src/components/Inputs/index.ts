import Checkbox from './Checkbox';
import NumberSlider from './NumberSlider';
import Radio from './Radio';
import Select from './Select';
import MultiSelect from './MultiSelect';
import Text from './Text';

export interface InputPropsBase {
  error?: string;
  label?: string;
}

export { Text, Checkbox, Select, Radio, NumberSlider, MultiSelect };
