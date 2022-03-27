import React, { useContext, useState } from "react";
import { Container } from "react-bootstrap";

import PopupWindowContainer from "../PopupWindowContainer/PopupWindowContainer";
import { AuthContext } from "../AuthContext";
import LogIn from "./LogIn";
import WelcomeMessage from "../SignUpForm/WelcomeMessage";
import Email from "./PasswordRecovery/Email";
import Code from "./PasswordRecovery/Code";
import Password from "./PasswordRecovery/Password";

const LogInForm = () => {
  const { setIsLogInShown } = useContext(AuthContext)!;

  const [stage, setStage] = useState(1);
  const [email, setEmail] = useState("");

  const goToNextStage = () => setStage((prev) => prev + 1);
  const goToWelcome = () => setStage(5);

  return (
    <PopupWindowContainer onOutsideClick={() => setIsLogInShown(false)}>
      <Container className="form-container bg-light p-4 m-4 p-sm-5 m-sm-5 rounded-3 w-auto shadow-lg">
        {stage === 1 && (
          <LogIn onSuccess={goToWelcome} onRecovery={goToNextStage} />
        )}
        {stage === 2 && (
          <Email email={email} setEmail={setEmail} onSuccess={goToNextStage} />
        )}
        {stage === 3 && <Code email={email} onSuccess={goToNextStage} />}
        {stage === 4 && <Password email={email} onSuccess={goToWelcome} />}
        {stage === 5 && (
          <WelcomeMessage onClose={() => setIsLogInShown(false)} />
        )}
      </Container>
    </PopupWindowContainer>
  );
};

export default LogInForm;
