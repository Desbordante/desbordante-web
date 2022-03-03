import React, { useContext } from "react";
import { Button } from "react-bootstrap";

import "./FeedbackButton.scss";
import { AuthContext } from "../AuthContext";

const FeedbackButton = () => {
  const { setIsFeedbackShown } = useContext(AuthContext)!;

  return (
    <Button
      className="feedback-button fw-bold shadow position-fixed"
      onClick={() => setIsFeedbackShown(true)}
    >
      Feedback
    </Button>
  );
};

export default FeedbackButton;
