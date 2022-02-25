import React, { useContext, useEffect, useRef, useState } from "react";
import { useMutation } from "@apollo/client";
import { Container } from "react-bootstrap";
import cookie from "cookie";

import PopupWindowContainer from "../PopupWindowContainer/PopupWindowContainer";
import { AuthContext } from "../AuthContext";
import { CREATE_USER } from "../../graphql/operations/mutations/createUser";
import {
  createUser,
  createUserVariables,
} from "../../graphql/operations/mutations/__generated__/createUser";
import StageOne from "./StageOne";
import StageTwo from "./StageTwo";
import { SignUpFormProps } from "../../types/types";
import hashPassword from "../../functions/hashPassword";
import { ErrorContext } from "../ErrorContext";
import {
  approveUserEmail,
  approveUserEmailVariables,
} from "../../graphql/operations/mutations/__generated__/approveUserEmail";
import { APPROVE_USER_EMAIL } from "../../graphql/operations/mutations/approveUserEmail";

const SignUpForm = () => {
  const { setIsSignUpShown } = useContext(AuthContext)!;
  const { showError } = useContext(ErrorContext)!;
  const [stage, setStage] = useState(1);
  const [userId, setUserId] = useState<string>();

  const [createUser] = useMutation<createUser, createUserVariables>(
    CREATE_USER
  );
  const [verifyEmail] = useMutation<
    approveUserEmail,
    approveUserEmailVariables
  >(APPROVE_USER_EMAIL);

  const signUpStageOne = (values: SignUpFormProps) => {
    createUser({
      variables: {
        props: {
          fullName: values.fullName,
          email: values.email,
          pwdHash: hashPassword(values.password),
          country: values.country,
          companyOrAffiliation: values.company,
          occupation: values.occupation,
        },
      },
    })
      .then((res) => {
        setUserId(res.data?.createUser.userID);
        setStage(2);
      })
      .catch((error) => showError({ message: error.message }));
  };

  const signUpStageTwo = ({ code }: { code: string }) => {
    verifyEmail({
      variables: {
        codeValue: +code,
        userID: userId!,
      },
    }).then((res) => {
      console.log(res);
      if (res.data) {
        document.cookie = cookie.serialize(
          "accessToken",
          res.data.approveUserEmail.accessToken
        );
        document.cookie = cookie.serialize(
          "refreshToken",
          res.data.approveUserEmail.refreshToken
        );
      }
    });
  };

  return (
    <PopupWindowContainer onOutsideClick={() => setIsSignUpShown(false)}>
      <Container className="form-container bg-light m-4 m-sm-5 rounded-3 w-auto shadow-lg">
        <div className="p-4 p-sm-5">
          {stage === 1 ? (
            <StageOne onSubmit={signUpStageOne} />
          ) : (
            <StageTwo
              email="kirill.stupakov.0@gmail.com"
              onSubmit={signUpStageTwo}
            />
          )}
        </div>
      </Container>
    </PopupWindowContainer>
  );
};

export default SignUpForm;
