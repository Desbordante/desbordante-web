/* eslint-disable no-console */

import "./App.scss";
import React, { useState } from "react";
import { Switch, BrowserRouter as Router, Route } from "react-router-dom";

import LoadingScreen from "./components/LoadingScreen/LoadingScreen";
import HomeScreen from "./components/HomeScreen/HomeScreen";
import ErrorScreen from "./components/ErrorScreen/ErrorScreen";
import Viewer from "./components/Viewer/Viewer";
import TopBar from "./components/TopBar/TopBar";
import SignUpForm from "./components/SignUpForm/SignUpForm";

const App: React.FC = () => {
  const [uploadProgress, setUploadProgress] = useState(0.0);

  return (
    <div className="App bg-light d-flex flex-column min-vh-100">
      <Router>
        <TopBar />
        <Switch>
          <Route path="/error" exact>
            <ErrorScreen code="404" message="Can't connect to the server." />
          </Route>

          <Route path="/loading" exact>
            <LoadingScreen onComplete={() => {}} progress={uploadProgress} />
          </Route>

          <Route path="/signup">
            <SignUpForm />
          </Route>

          <Route path="/:taskID">
            <Viewer />
          </Route>

          <Route path="/" exact>
            <HomeScreen setUploadProgress={setUploadProgress} />
          </Route>
        </Switch>
      </Router>
    </div>
  );
};

export default App;
