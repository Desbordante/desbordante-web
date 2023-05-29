import { CreateForm, Defaults, FormFieldsProps } from 'types/form';

const BLANKDefaults = {} satisfies Defaults;

const BLANKFields = {} satisfies FormFieldsProps<typeof BLANKDefaults>;

export const BLANKForm = CreateForm({
  formDefaults: BLANKDefaults,
  formFields: BLANKFields,
});
