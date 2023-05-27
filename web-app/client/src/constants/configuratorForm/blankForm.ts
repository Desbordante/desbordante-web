import {
  CreateForm,
  CreateFormProcessor,
  Defaults,
  FormFieldsProps,
  FormHook,
} from 'types/form';

const blank_defaults = {} satisfies Defaults;

const blank_fields = {} satisfies FormFieldsProps<typeof blank_defaults>;

const useBlankHook: FormHook<
  typeof blank_defaults,
  typeof blank_fields
> = () => {
  return;
};

const blank_processor = CreateFormProcessor<
  typeof blank_defaults,
  typeof blank_fields
>((form) => {
  return form;
}, []);

export const blank_form = CreateForm(
  blank_defaults,
  blank_fields,
  useBlankHook,
  blank_processor
);
