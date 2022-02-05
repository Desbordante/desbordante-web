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
  const {
    fileName,
    setFileName,
    taskId,
    setTaskId,
    taskStatus,
    setTaskStatus,
  } = useContext(TaskContext)!;
  const { user } = useContext(AuthContext)!;

  return (
    <Navbar variant="dark" bg="dark" sticky="top">
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
        {!user && (
          <Button onClick={() => history.push("/signup")} className="mx-2">
            Sign up
          </Button>
        )}
        {taskId && (
          <Button
            variant="danger"
            onClick={() => {
              axios.post(`${serverURL}/cancelTask?taskID=${taskId}`);
              history.push("/");
              setFileName("");
              setTaskId("");
              setTaskStatus("UNSCHEDULED");
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
