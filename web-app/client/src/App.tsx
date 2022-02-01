/* eslint-disable no-console */

import "./App.scss";
import React, { useState } from "react";
import { Switch, BrowserRouter as Router, Route } from "react-router-dom";

import LoadingScreen from "./components/LoadingScreen/LoadingScreen";
import HomeScreen from "./components/HomeScreen/HomeScreen";
import ErrorScreen from "./components/ErrorScreen/ErrorScreen";
import Viewer from "./components/Viewer/Viewer";
import { TaskContextProvider } from "./components/TaskContext/TaskContext";
import TopBar from "./components/TopBar/TopBar";

const App: React.FC = () => {
  const [uploadProgress, setUploadProgress] = useState(0.0);

  return (
    <TaskContextProvider>
      <div className="App min-vh-100 bg-light d-flex flex-column">
        <Router>
          <TopBar />
          <Switch>
            {/* Error Page */}
            <Route path="/error" exact>
              <ErrorScreen code="404" message="Can't connect to the server." />
            </Route>

            {/* Loading Page */}
            <Route path="/loading" exact>
              <LoadingScreen onComplete={() => {}} progress={uploadProgress} />
            </Route>

            {/* View Page */}
            <Route path="/(attrs|deps)/:taskID/">
              <Viewer />
            </Route>

            {/* Home Page */}
            <Route path="/" exact>
              <HomeScreen setUploadProgress={setUploadProgress} />
            </Route>
          </Switch>
        </Router>
      </div>
    </TaskContextProvider>
  );
};

export default App;
