import React from "react";

import Header from "../Header/Header";
import FileForm from "../FileForm/FileForm";
import { FileFormContextProvider } from "../FileFormContext";

const HomeScreen = () => (
  <div className="bg-dark flex-grow-1 d-flex flex-column">
    <Header />
    <FileFormContextProvider>
      <FileForm />
    </FileFormContextProvider>
  </div>
);

export default HomeScreen;
