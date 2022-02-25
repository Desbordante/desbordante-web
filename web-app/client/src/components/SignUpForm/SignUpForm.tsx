import React, { useContext, useEffect, useState } from "react";
import { Container } from "react-bootstrap";

import PopupWindowContainer from "../PopupWindowContainer/PopupWindowContainer";
import { AuthContext } from "../AuthContext";
import StageOne from "./StageOne";
import StageTwo from "./StageTwo";
import WelcomeMessage from "./WelcomeMessage";

const SignUpForm = () => {
  const { setIsSignUpShown, user } = useContext(AuthContext)!;
  const [stage, setStage] = useState(user?.id && !user?.isVerified ? 2 : 1);

  const goToNextStage = () => setStage((prevStage) => prevStage + 1);

  return (
    <PopupWindowContainer onOutsideClick={() => setIsSignUpShown(false)}>
      <Container className="form-container bg-light m-4 m-sm-5 p-4 p-sm-5 rounded-3 w-auto shadow-lg">
        {stage === 1 && <StageOne onSuccess={goToNextStage} />}
        {stage === 2 && <StageTwo onSuccess={goToNextStage} />}
        {stage === 3 && (
          <WelcomeMessage onClose={() => setIsSignUpShown(false)} />
        )}
      </Container>
    </PopupWindowContainer>
  );
};

export default SignUpForm;
