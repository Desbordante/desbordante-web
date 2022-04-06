import React, { useContext } from "react";
import { Container, Navbar } from "react-bootstrap";
import { useHistory, useLocation } from "react-router-dom";

import Button from "../Button/Button";
import { TaskContext } from "../TaskContext";
import { AuthContext } from "../AuthContext";
import ProgressBar from "../ProgressBar/ProgressBar";
import Phasename from "./Phasename/Phasename";

const TopBar = () => {
  const history = useHistory();
  const location = useLocation();
  const { taskState, resetTask, dataset } = useContext(TaskContext)!;
  const { user, setIsSignUpShown, setIsLogInShown, signOut } =
    useContext(AuthContext)!;

  const isHomeScreen = location.pathname === "/";

  return (
    <Navbar variant="dark" bg="dark" sticky="top" className="d-block pb-0">
      <Container fluid className="mb-2">
        <Navbar.Brand
          className="cursor-pointer"
          onClick={() => {
            resetTask();
            history.push("/");
          }}
        >
          <img
            src="/icons/logo.svg"
            alt="logo"
            width="30"
            height="30"
            className="d-inline-block align-top me-2"
          />{" "}
          Desbordante
        </Navbar.Brand>
        <Container fluid className="d-flex text-muted ps-0">
          {!isHomeScreen && dataset && dataset.originalFileName && (
            <p className="mx-1 my-auto text-secondary">
              {dataset.originalFileName}
            </p>
          )}
          {taskState &&
            "progress" in taskState &&
            taskState.processStatus === "IN_PROCESS" && (
              <p className="mx-1 my-auto text-secondary">
                {taskState.processStatus}
              </p>
            )}
        </Container>
        {user?.name ? (
          <>
            <p className="mb-0 mx-2 text-light text-nowrap">
              Logged in as <span className="fw-bold">{user.name}</span>
            </p>
            {!user.isVerified && (
              <Button onClick={() => setIsSignUpShown(true)} className="mx-2">
                Verify Email
              </Button>
            )}
            <Button variant="outline-danger" onClick={signOut} className="mx-2">
              Sign Out
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline-light"
              onClick={() => setIsLogInShown(true)}
              className="mx-2"
            >
              Log In
            </Button>
            <Button onClick={() => setIsSignUpShown(true)} className="mx-2">
              Sign Up
            </Button>
          </>
        )}
      </Container>
      {!isHomeScreen &&
        taskState &&
        "progress" in taskState &&
        !!taskState.progress && (
          <>
            <ProgressBar
              progress={taskState.progress / 100}
              maxWidth={100}
              thickness={0.35}
            />
            {/* @ts-ignore */}
            <Phasename {...taskState} />
          </>
        )}
    </Navbar>
  );
};

export default TopBar;
