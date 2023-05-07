import { useQuery } from '@apollo/client';
import {
  getCountOfColumns,
  getCountOfColumnsVariables,
} from '@graphql/operations/queries/__generated__/getCountOfColumns';
import { GET_COUNT_OF_COLUMNS } from '@graphql/operations/queries/getDatasetColumnCount';
import { showError } from '@utils/toasts';
import {
  Defaults,
  FormFieldsProps,
  CreateFormProcessor,
  CreateForm,
  FormHook,
} from 'types/form';
import { MainPrimitiveType } from 'types/globalTypes';

const test_defaults = {
  algoName: '',
  maxLHS: 123,
  LHSColumn: [] as string[],
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
    type: 'number_input',
  },
  LHSColumn: {
    order: 2,
    label: 'LHS Columns',
    type: 'multi_select',
    options: [] as string[],
  },
  testIUFDSHUI: {
    order: 3,
    type: 'custom',
    label: 'Test custom',
    test: 'test',
    component: (props) => <div>{props.test}</div>,
  },
} satisfies FormFieldsProps<typeof test_defaults>;

const useTestHook: FormHook<typeof test_defaults, typeof test_fields> = (
  fileID,
  form, // TODO: add function to edit form
  methods
) => {
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

  form.LHSColumn.options =
    data?.datasetInfo.header ||
    [...Array(data?.datasetInfo.countOfColumns || 0)].map((_, i) => String(i));

  console.log('Hello from field hook!', data);
};

const test_processor = CreateFormProcessor<
  typeof test_defaults,
  typeof test_fields
>(
  (form, methods) => {
    form.testIUFDSHUI.test = 'asd';

    console.log('Hello from field logic!');

    return form;
  },
  ['maxLHS']
);

export const test_form = CreateForm(
  test_defaults,
  test_fields,
  useTestHook,
  test_processor
);
