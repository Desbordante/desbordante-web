import React from "react";

import Header from "../Header/Header";
import FileForm from "../FileForm/FileForm";

const HomeScreen = () => (
  <div className="bg-dark flex-grow-1 d-flex flex-column">
    <Header />
    <FileForm />
  </div>
);

export default HomeScreen;
