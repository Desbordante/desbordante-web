import { FormConfig } from 'types/configurator';

type TemplateFields = {
  templateAny: any;
  templateString: string;
  templateConstant: 'TemplateConstant';
  templateNumber: number;
  templateBool: boolean;
  templateArray: number[];
};

const formDefaults = {
  templateAny: null,
  templateString: 'Template',
  templateConstant: 'TemplateConstant',
  templateNumber: 0,
  templateBool: false,
  templateArray: [1, 2, 3],
} as TemplateFields;

const TemplateForm: FormConfig<TemplateFields> = {
  primitiveType: null,
  formDefaults,
};

export type { TemplateFields };
export default TemplateForm;
