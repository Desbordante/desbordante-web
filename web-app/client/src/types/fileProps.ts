export type FDFileProps = {
  delimiter: string;
  hasHeader: boolean;
};

export type CFDFileProps = {
  delimiter: string;
  hasHeader: boolean;
};

export const fileFormatList = ["Singular", "Tabular"] as const;
export type FileFormat = typeof fileFormatList[number];

export type ARFileProps = {
  delimiter: string;
  fileFormat: "Singular" | "Tabular";
  transactionIdColumn: string;
  itemSetColumn: string;
  hasTransactionId: boolean;
};

export type EDPFileProps = {
  delimiter: string;
  hasHeader: boolean;
};

export type FileProps = FDFileProps & CFDFileProps & ARFileProps & EDPFileProps;
