import { UnionToIntersection } from 'type-fest';
import TemplateForm from '@pages/create-task/configurator-forms/TemplateForm';
import MFDForm from './configurator-forms/MFDForm';

const configurators = [MFDForm, TemplateForm] as const;
type AlgorithmConfig = typeof configurators[number]['formDefaults'];
type AlgorithmProps = UnionToIntersection<AlgorithmConfig>;
