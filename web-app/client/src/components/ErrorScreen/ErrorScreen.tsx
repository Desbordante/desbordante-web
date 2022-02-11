import React, { useContext } from "react";
import { Container } from "react-bootstrap";

import "./ErrorScreen.scss";
import { ErrorContext } from "../ErrorContext";
import PopupWindowContainer from "../PopupWindowContainer/PopupWindowContainer";

const ErrorScreen = () => {
  const { error, hideError } = useContext(ErrorContext)!;

  return (
    <PopupWindowContainer onOutsideClick={hideError}>
      <Container className="p-5 bg-light w-auto rounded-3 shadow">
        <h3>
          <span className="text-danger">
            Error{error!.code && ` ${error!.code}`}:{" "}
          </span>{" "}
          {error!.message}
        </h3>
        {error!.suggestion && <p className="mb-0">{error!.suggestion}</p>}
      </Container>
    </PopupWindowContainer>
  );
};

export default ErrorScreen;
