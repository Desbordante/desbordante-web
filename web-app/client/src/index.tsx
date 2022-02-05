import "./index.scss";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { AuthContextProvider } from "./components/AuthContext";
import { TaskContextProvider } from "./components/TaskContext/TaskContext";

ReactDOM.render(
  <AuthContextProvider>
    <TaskContextProvider>
      <App />
    </TaskContextProvider>
  </AuthContextProvider>,
  document.getElementById("root")
);
