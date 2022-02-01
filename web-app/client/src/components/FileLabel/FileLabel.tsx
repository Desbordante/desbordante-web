import React from "react";
import "./FileLabel.scss";
import { useDropzone } from "react-dropzone";

/* eslint-disable no-unused-vars */
interface Props {
  file: File | null;
  fileExistenceValidator: (file: File | null) => boolean;
  fileSizeValidator: (file: File | null) => boolean;
  fileFormatValidator: (file: File | null) => boolean;
  onClick: () => void;
  setFile: (file: File) => void;
  builtinDataset: string | null;
  className: string;
}

const FileLabel: React.FC<Props> = ({
  file,
  fileExistenceValidator,
  fileSizeValidator,
  fileFormatValidator,
  onClick,
  setFile,
  builtinDataset,
  className = "",
}) => {
  const { getRootProps } = useDropzone({
    onDrop: (acceptedFiles) => setFile(acceptedFiles[0]),
  });

  let displayText = "";
  if (fileExistenceValidator(file)) {
    displayText = file!.name;
    if (displayText.length > 40) {
      displayText = displayText.slice(0, 40);
    }

    if (!fileFormatValidator(file)) {
      displayText = "This format is not supported";
    }

    if (!fileSizeValidator(file)) {
      displayText = "This file is too large";
    }
  } else {
    displayText = "Upload your dataset or choose one of ours";
  }

  let isError =
    fileExistenceValidator(file) &&
    (!fileSizeValidator(file) || !fileFormatValidator(file));

  if (builtinDataset) {
    displayText = builtinDataset;
    isError = false;
  }

  return (
    <div
      className={`file-label rounded-pill px-3 py-2 border border-2 cursor-pointer ${
        isError ? "border-danger text-danger" : "border-lighter-dark text-grey"
      } ${className}`}
      /* eslint-disable-next-line react/jsx-props-no-spreading */
      {...getRootProps()}
      onClick={onClick}
    >
      {displayText}
    </div>
  );
};

export default FileLabel;
