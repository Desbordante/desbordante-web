/* eslint-disable no-console */

import React from "react";
import { useHistory } from "react-router-dom";

import "./HomeScreen.scss";
import Header from "../Header/Header";
import FileForm from "../FileForm/FileForm";

/* eslint-disable no-unused-vars */
interface Props {
  setUploadProgress: (n: number) => void;
}
/* eslint-enable no-unused-vars */

const HomeScreen: React.FC<Props> = ({ setUploadProgress }) => {
  const history = useHistory();

  return (
    <div className="bg-dark h-100 flex-grow-1">
      <Header />
      <FileForm
        onSubmit={() => history.push("/loading")}
        setUploadProgress={setUploadProgress}
        handleResponse={(res) => {
          history.push(`/${res.data.taskID}`);
        }}
      />
    </div>
  );
};

export default HomeScreen;
