import React, { useContext } from "react";
import { Button, Container } from "react-bootstrap";

import "./FeedbackButton.scss";
import { AuthContext } from "../AuthContext";

const FeedbackButton = () => {
  const { setIsFeedbackShown } = useContext(AuthContext)!;

  return (
    <Button
      variant="primary"
      className="feedback-button position-absolute fw-bold"
      onClick={() => setIsFeedbackShown(true)}
    >
      Feedback
    </Button>
  );
};

export default FeedbackButton;
