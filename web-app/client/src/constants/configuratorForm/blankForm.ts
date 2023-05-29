import { CreateForm, Defaults, FormFieldsProps } from 'types/form';

const blank_defaults = {} satisfies Defaults;

const blank_fields = {} satisfies FormFieldsProps<typeof blank_defaults>;

export const blank_form = CreateForm(blank_defaults, blank_fields);
