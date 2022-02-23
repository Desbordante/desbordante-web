import React, { useContext } from "react";
import "./FileLabel.scss";
import { useDropzone } from "react-dropzone";
import { AlgorithmConfigContext } from "../AlgorithmConfigContext";
import { AuthContext } from "../AuthContext";
import { BuiltinDataset, Dataset, isBuiltinDataset } from "../../types/dataset";

/* eslint-disable no-unused-vars */
interface Props {
  onClick?: () => void;
  className: string;
  dataset?: Dataset;
  setDataset: React.Dispatch<React.SetStateAction<Dataset | undefined>>;
}

const FileLabel: React.FC<Props> = ({
  onClick,
  className = "",
  dataset,
  setDataset,
}) => {
  const { user } = useContext(AuthContext)!;
  const { validators } = useContext(AlgorithmConfigContext)!;
  const { getRootProps } = useDropzone({
    onDrop: user?.canUploadFiles
      ? (acceptedFiles) => setDataset(acceptedFiles[0])
      : undefined,
  });

  let displayText = "Upload your dataset or choose one of ours";

  if (dataset) {
    if (isBuiltinDataset(dataset)) {
      displayText = (dataset as BuiltinDataset).fileName;
    } else {
      displayText = (dataset as File)!.name;
      if (displayText.length > 40) {
        displayText = displayText.slice(0, 40);
      }

      if (!validators.isOfValidFormat(dataset as File)) {
        displayText = "This format is not supported";
      }

      if (!validators.isOfValidSize(dataset as File)) {
        displayText = "This file is too large";
      }
    }
  }

  let isError = false;
  if (dataset && !isBuiltinDataset(dataset)) {
    isError =
      validators.isFile(dataset as File) &&
      (!validators.isOfValidSize(dataset as File) ||
        !validators.isOfValidFormat(dataset as File));
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
