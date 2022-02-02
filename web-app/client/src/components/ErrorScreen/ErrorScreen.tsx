import React from "react";
import { useHistory } from "react-router-dom";
import { Container } from "react-bootstrap";

import "./ErrorScreen.scss";
import Button from "../Button/Button";

interface Props {
  code: string;
  message: string;
}

const ErrorScreen: React.FC<Props> = ({ code, message }) => {
  const history = useHistory();

  return (
    <Container
      fluid
      className="bg-dark h-100 flex-grow-1 d-flex flex-column align-items-center justify-content-center"
    >
      <h1 className="text-white my-3">
        <span className="text-danger">Error {code}: </span>
        {message}
      </h1>
      <Button onClick={() => history.push("/")}>Try again</Button>
    </Container>
  );
};

export default ErrorScreen;
