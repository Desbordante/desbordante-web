import { DatetimepickerProps } from 'react-datetime';

export const renderDay: DatetimepickerProps['renderDay'] = (
  props,
  currentDate,
) => {
  return <td {...props}>{currentDate.date()}</td>;
};
