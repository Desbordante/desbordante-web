import React from "react";

import Header from "../Header/Header";
import FileForm from "../FileForm/FileForm";
import { FileFormContextProvider } from "../FileFormContext";

const HomeScreen = () => (
  <div className="bg-dark h-100 flex-grow-1">
    <Header />
    <FileFormContextProvider>
      <FileForm />
    </FileFormContextProvider>
  </div>
);

export default HomeScreen;
