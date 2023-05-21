import { useQuery } from '@apollo/client';
import { useEffect } from 'react';
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
  FormSelectOptions,
  ArrayToOptions,
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
    options: ArrayToOptions(['Pyro', 'Pyro2']),
    tooltip: 'asdasdasd',
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
    options: [] as FormSelectOptions,
  },
  testIUFDSHUI: {
    order: 3,
    type: 'custom',
    label: 'Test custom',
    test: 'test',
    component: (props) => (
      <div>
        <button>{props.test}</button>
      </div>
    ),
  },
} satisfies FormFieldsProps<typeof test_defaults>;

let callCount = 0;

const useTestHook: FormHook<typeof test_defaults, typeof test_fields> = (
  fileID,
  form, // TODO: add function to edit form
  setForm,
  methods
) => {
  const { loading, error, data } = useQuery<
    getCountOfColumns,
    getCountOfColumnsVariables
  >(GET_COUNT_OF_COLUMNS, {
    variables: { fileID },
    onError: (error) => {
      showError(
        error.message,
        "Can't fetch columns information. Please try later."
      );
    },
  });

  useEffect(() => {
    setForm((formSnapshot) => {
      formSnapshot.LHSColumn.options = ArrayToOptions(
        data?.datasetInfo.header ||
          [...Array(data?.datasetInfo.countOfColumns || 0)].map((_, i) =>
            String(i)
          )
      );
      return formSnapshot;
    });

    console.log('Hello from field hook!', ++callCount, data);
  }, [data, form.LHSColumn]);
};

const test_processor = CreateFormProcessor<
  typeof test_defaults,
  typeof test_fields
>(
  (form, methods) => {
    console.dir(methods.getValues());
    form.testIUFDSHUI.test = 'asd';

    console.log('Hello from field logic!');

    return form;
  },
  ['algoName']
);

export const test_form = CreateForm(
  test_defaults,
  test_fields,
  useTestHook,
  test_processor
);
