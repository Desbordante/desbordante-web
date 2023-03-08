import { Form, getFormDefaults, Interceptor } from './testForm';

type FieldNames = 'algoName' | 'maxLHS';

export const form = {
  algoName: {
    order: 0,
    type: 'select',
    label: 'Algorithm Name',
    defaultValue: 'Pyro',
    options: ['Pyro', 'Pyro2'],
  },
  maxLHS: {
    order: 1,
    label: 'Maximum LHS',
    type: 'number-input',
    defaultValue: 0,
  },
// eslint-disable-next-line prettier/prettier
} satisfies Form<FieldNames>;

export const formDefaultValues = getFormDefaults(form);

export const dependencies: FieldNames[] = ['algoName', 'maxLHS'];

export const fignya: Interceptor<typeof form> = (
  form,
  methods
) => {
  return form;
};