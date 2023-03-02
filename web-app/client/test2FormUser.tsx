import { useQuery } from '@apollo/client';
import {
  getCountOfColumns,
  getCountOfColumnsVariables,
} from '@graphql/operations/queries/__generated__/getCountOfColumns';
import { GET_COUNT_OF_COLUMNS } from '@graphql/operations/queries/getDatasetColumnCount';
import { showError } from '@utils/toasts';
import {
  Defaults,
  FormFields,
  CreateFormProcessor,
  CreateForm,
} from 'types/form';
import { MainPrimitiveType } from 'types/globalTypes';

const test_defaults = {
  algoName: '',
  maxLHS: 123,
  testIUFDSHUI: 'asd',
} satisfies Defaults;

const test_fields = {
  algoName: {
    order: 0,
    type: 'select',
    label: 'Algorithm Name',
    options: ['Pyro', 'Pyro2'],
    rules: {
      validate: (value, formValues) => {
        return formValues.algoName == 'Pyro';
      },
    },
  },
  maxLHS: {
    order: 1,
    label: 'Maximum LHS',
    type: 'checkbox',
  },
  testIUFDSHUI: {
    order: 3,
    type: 'custom',
    label: 'Test custom',
    test: 'test',
    component: (props) => <div>{props.test}</div>,
  },
} satisfies FormFields<typeof test_defaults>;

const test_processor = CreateFormProcessor<
  typeof test_defaults,
  typeof test_fields
>((fileID, form, methods) => {
  const { loading, error, data } = useQuery<
    getCountOfColumns,
    getCountOfColumnsVariables
  >(GET_COUNT_OF_COLUMNS, {
    variables: { fileID: fileID },
    onError: (error) => {
      showError(
        error.message,
        "Can't fetch columns information. Please try later."
      );
    },
  });
  form.testIUFDSHUI.test = 'asd';

  return form;
}, []);

export const test_form = CreateForm(test_defaults, test_fields, test_processor);
