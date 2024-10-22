import { icons } from './defenitions';

type IconConfig = typeof icons;
export type IconName = keyof IconConfig;
type IconProps<TName extends IconName> = Parameters<IconConfig[TName]>[0];

const Icon = <TName extends IconName>(
  props: { name: TName } & IconProps<TName>,
) => {
  if (!icons[props.name]) {
    throw new Error(`There is no icon with name "${props.name}!"`);
  }
  return icons[props.name]({ ...props, role: 'img' });
};

export default Icon;
