import React, { useContext } from "react";
import { Switch, BrowserRouter as Router, Route } from "react-router-dom";

import "./App.scss";
import HomeScreen from "./components/HomeScreen/HomeScreen";
import ErrorScreen from "./components/ErrorScreen/ErrorScreen";
import Viewer from "./components/Viewer/Viewer";
import TopBar from "./components/TopBar/TopBar";
import SignUpForm from "./components/SignUpForm/SignUpForm";
import FeedbackForm from "./components/FeedbackForm/FeedbackForm";
import { ErrorContext } from "./components/ErrorContext";
import { AuthContext } from "./components/AuthContext";

const App: React.FC = () => {
  const { isErrorShown } = useContext(ErrorContext)!;
  const { isSignUpShown, isFeedbackShown } = useContext(AuthContext)!;

  return (
    <div className="App bg-light d-flex flex-column min-vh-100">
      <Router>
        <TopBar />
        {isErrorShown && <ErrorScreen />}
        {isSignUpShown && <SignUpForm />}
        {isFeedbackShown && <FeedbackForm />}
        <Switch>
          <Route path="/:taskID">
            <Viewer />
          </Route>

          <Route path="/">
            <HomeScreen />
          </Route>
        </Switch>
      </Router>
    </div>
  );
};

export default App;
