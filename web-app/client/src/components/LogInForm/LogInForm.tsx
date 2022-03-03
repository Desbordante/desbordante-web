import React, { useContext, useState } from "react";
import { Container } from "react-bootstrap";

import PopupWindowContainer from "../PopupWindowContainer/PopupWindowContainer";
import { AuthContext } from "../AuthContext";
import StageOne from "./StageOne";
import WelcomeMessage from "../SignUpForm/WelcomeMessage";

const LogInForm = () => {
  const { setIsLogInShown } = useContext(AuthContext)!;

  const [stage, setStage] = useState(1);

  const goToNextStage = () => setStage((prev) => prev + 1);

  return (
    <PopupWindowContainer onOutsideClick={() => setIsLogInShown(false)}>
      <Container className="form-container bg-light p-4 m-4 p-sm-5 m-sm-5 rounded-3 w-auto shadow-lg">
        {stage === 1 && <StageOne onSuccess={goToNextStage} />}
        {stage === 2 && (
          <WelcomeMessage onClose={() => setIsLogInShown(false)} />
        )}
      </Container>
    </PopupWindowContainer>
  );
};

export default LogInForm;
