/* eslint-disable no-console */

import React from "react";

import "./HomeScreen.scss";
import Header from "../Header/Header";
import FileForm from "../FileForm/FileForm";

const HomeScreen = () => (
  <div className="bg-dark h-100 flex-grow-1">
    <Header />
    <FileForm />
  </div>
);

export default HomeScreen;
