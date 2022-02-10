import React, { useContext } from "react";
import { Container, Navbar } from "react-bootstrap";
import axios from "axios";
import { useHistory } from "react-router-dom";

import "./TopBar.scss";
import Button from "../Button/Button";
import { TaskContext } from "../TaskContext/TaskContext";
import { serverURL } from "../../APIFunctions";
import { AuthContext } from "../AuthContext";

const TopBar = () => {
  const history = useHistory();
  const { fileName, taskId, taskStatus } = useContext(TaskContext)!;
  const { user, setIsSignUpShown, setIsFeedbackShown } =
    useContext(AuthContext)!;

  return (
    <Navbar variant="dark" bg="dark" sticky="top" className="position-relative">
      <Container fluid>
        <Navbar.Brand href="/">
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
          {fileName && (
            <p className="mx-1 my-auto text-secondary">{fileName}</p>
          )}
          {taskStatus !== "UNSCHEDULED" && (
            <p className="mx-1 my-auto text-secondary">{taskStatus}</p>
          )}
        </Container>
        <Button onClick={() => setIsFeedbackShown(true)} className="mx-2">
          Send Feedback
        </Button>
        {!user && (
          <Button onClick={() => setIsSignUpShown(true)} className="mx-2">
            Sign Up
          </Button>
        )}
        {taskId && (
          <Button
            variant="danger"
            onClick={() => {
              axios.post(`${serverURL}/cancelTask?taskID=${taskId}`);
              history.push("/");
            }}
            className="mx-2"
          >
            Cancel
          </Button>
        )}
      </Container>
    </Navbar>
  );
};

export default TopBar;
