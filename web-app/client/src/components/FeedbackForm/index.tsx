import React, { useContext, useState } from "react";
import { Container } from "react-bootstrap";

import { AuthContext } from "../AuthContext";
import PopupWindowContainer from "../PopupWindowContainer/PopupWindowContainer";
import FeedbackForm from "./FeedbackForm";
import FeedbackSuccess from "./FeedbackSuccess";

const Index = () => {
  const { setIsFeedbackShown } = useContext(AuthContext)!;
  const [stage, setStage] = useState(0);

  return (
    <PopupWindowContainer onOutsideClick={() => setIsFeedbackShown(false)}>
      <Container className="form-container bg-light p-4 m-4 p-sm-5 m-sm-5 rounded-3 w-auto shadow-lg">
        {stage === 0 && (
          <FeedbackForm onSuccess={() => setStage((prev) => prev + 1)} />
        )}
        {stage === 1 && (
          <FeedbackSuccess onClose={() => setIsFeedbackShown(false)} />
        )}
      </Container>
    </PopupWindowContainer>
  );
};

export default Index;
