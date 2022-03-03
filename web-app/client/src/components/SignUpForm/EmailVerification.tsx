import React, { useContext, useEffect } from "react";
import { Formik, FormikHelpers } from "formik";
import { Form, Button } from "react-bootstrap";
import { useMutation } from "@apollo/client";

import {
  approveUserEmail,
  approveUserEmailVariables,
} from "../../graphql/operations/mutations/__generated__/approveUserEmail";
import { APPROVE_USER_EMAIL } from "../../graphql/operations/mutations/approveUserEmail";
import { AuthContext } from "../AuthContext";
import { issueVerificationCode } from "../../graphql/operations/mutations/__generated__/issueVerificationCode";
import { ISSUE_VERIFICATION_CODE } from "../../graphql/operations/mutations/issueVerificationCode";

interface Props {
  onSuccess: () => void;
}

const StageTwo: React.FC<Props> = ({ onSuccess }) => {
  const { user, applyTokens } = useContext(AuthContext)!;

  const initialValues = {
    code: "",
  };
  const validate = (values: typeof initialValues) => {
    const errors: any = {};
    if (values.code.length !== 4) {
      errors.code = "Must be four characters long";
    }
    if (!values.code) {
      errors.code = "Required";
    }

    return errors;
  };

  const [verifyEmail] = useMutation<
    approveUserEmail,
    approveUserEmailVariables
  >(APPROVE_USER_EMAIL);
  const [issueCode] = useMutation<issueVerificationCode>(
    ISSUE_VERIFICATION_CODE
  );

  const signUpStageTwo = async (
    values: typeof initialValues,
    formikHelpers: FormikHelpers<typeof initialValues>
  ) => {
    try {
      const response = await verifyEmail({
        variables: {
          codeValue: +values.code,
        },
      });

      if (response.data?.approveUserEmail) {
        applyTokens(response.data.approveUserEmail);
        onSuccess();
      }
    } catch (error) {
      issueCode();
      formikHelpers.setErrors({
        code: "Incorrect code. We have sent you anoter one.",
      });
    }
  };

  useEffect(() => {
    issueCode();
  }, []);

  return (
    <>
      <h1 className="text-center fw-bold mb-4">Email Verification</h1>
      <p className="mb-4">
        We have sent the verification code to{" "}
        <span className="fw-bold">{user?.email}</span>
      </p>
      <Formik
        initialValues={initialValues}
        validate={validate}
        onSubmit={signUpStageTwo}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
        }) => (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Code</Form.Label>
              <Form.Control
                placeholder="****"
                name="code"
                value={values.code}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={touched.code && !!errors.code}
              />
              <Form.Control.Feedback type="invalid">
                {errors.code}
              </Form.Control.Feedback>
            </Form.Group>

            <Button
              variant="outline-primary"
              type="submit"
              className="mt-2 w-100"
              disabled={isSubmitting}
            >
              Verify
            </Button>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default StageTwo;
