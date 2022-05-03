import { InputFileFormat } from "./globalTypes";

export type FDFileProps = {
  delimiter: string;
  hasHeader: boolean;
};

export type CFDFileProps = {
  delimiter: string;
  hasHeader: boolean;
};

export const fileFormatList: InputFileFormat[] = [InputFileFormat.SINGULAR, InputFileFormat.TABULAR];

export type ARFileProps = {
  delimiter: string;
  fileFormat: InputFileFormat;
  transactionIdColumn: string;
  itemSetColumn: string;
  hasTransactionId: boolean;
};

export type EDPFileProps = {
  delimiter: string;
  hasHeader: boolean;
};

export type FileProps = FDFileProps & CFDFileProps & ARFileProps & EDPFileProps;
