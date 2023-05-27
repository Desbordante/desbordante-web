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

const test_defaults = {
  algoName: 'Pyro',
  maxLHS: 123,
  LHSColumn: [0] as number[],
  test1: 'asd',
} satisfies Defaults;

const test_fields = {
  algoName: {
    order: 0,
    type: 'select',
    label: 'Algorithm Name',
    options: ArrayToOptions(['Pyro', 'Pyro2']),
    isLoading: false,
    tooltip: 'asdasdasd',
    rules: {
      validate: {
        algoName: (value) => value === 'Pyro' || 'Should be Pyro',
      },
    },
  },
  maxLHS: {
    order: 1,
    label: 'Maximum LHS',
    type: 'number_input',
    numberInputProps: { defaultNum: 1.0 },
  },
  LHSColumn: {
    order: 2,
    label: 'LHS Columns',
    type: 'multi_select',
    options: [] as FormSelectOptions,
    isLoading: true as boolean,
    rules: {
      validate: {
        LHSColumn: (value) => (value as number[]).length > 0,
      },
    },
  },
  test1: {
    order: 3,
    type: 'custom',
    label: 'Test custom',
    test: 'test',
    isConstant: true,
    component: (props) => (
      <div>
        <button>{props.test}</button>
      </div>
    ),
  },
} satisfies FormFieldsProps<typeof test_defaults>;

const useTestHook: FormHook<typeof test_defaults, typeof test_fields> = (
  fileID,
  form,
  setForm,
  methods
) => {
  useEffect(() => {
    // console.log('First hook call. Fetching data');
  }, []);

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
    // console.log(`Hook Effect. Loading flag changed to ${loading}`);
    setForm((formSnapshot) => {
      formSnapshot.LHSColumn.isLoading = loading;
      return formSnapshot;
    });
  }, [loading, setForm]);

  useEffect(() => {
    if (!loading) {
      // console.log(`Hook Effect. Updating options in form`);
      // console.log(`Hook Effect. Data`, data);
      setForm((formSnapshot) => {
        formSnapshot.LHSColumn.options = ArrayToOptions(
          [...Array(data?.datasetInfo.countOfColumns || 0)].map((_, i) => i),
          'Column'
        );
        return { ...formSnapshot };
      });
    }
  }, [data, form.LHSColumn, setForm]);
};

let test_storage = 'asdasd';

const test_processor = CreateFormProcessor<
  typeof test_defaults,
  typeof test_fields
>(
  (form, methods) => {
    console.log('Processor called', test_storage);

    test_storage = 'hahaha';

    return form;
  },
  [['algoName']]
);

export const test_form = CreateForm(
  test_defaults,
  test_fields,
  useTestHook,
  test_processor
);
