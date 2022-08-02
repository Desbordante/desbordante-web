import React from "react";
import { Formik, FormikHelpers } from "formik";
import { Form, Button } from "react-bootstrap";
import { useMutation } from "@apollo/client";
import * as Yup from "yup";

import { ISSUE_CODE_FOR_PASSWORD_RECOVERY } from "../../../graphql/operations/mutations/issueCodeForPasswordRecovery";
import {
  issueCodeForPasswordRecovery,
  issueCodeForPasswordRecoveryVariables,
} from "../../../graphql/operations/mutations/__generated__/issueCodeForPasswordRecovery";
import { APPROVE_RECOVERY_CODE } from "../../../graphql/operations/mutations/approveRecoveryCode";
import {
  approveRecoveryCode,
  approveRecoveryCodeVariables,
} from "../../../graphql/operations/mutations/__generated__/approveRecoveryCode";

const codeSchema = Yup.object().shape({
  code: Yup.string()
    .length(4, "Must be four characters long")
    .required("Required"),
});

interface Props {
  email: string;
  onSuccess: () => void;
}

const Code: React.FC<Props> = ({ onSuccess, email }) => {
  const [issueCode] = useMutation<
    issueCodeForPasswordRecovery,
    issueCodeForPasswordRecoveryVariables
  >(ISSUE_CODE_FOR_PASSWORD_RECOVERY);
  const [approveCode] = useMutation<
    approveRecoveryCode,
    approveRecoveryCodeVariables
  >(APPROVE_RECOVERY_CODE);

  const initialValues = {
    code: "",
  };

  const handleSubmit = async (
    values: typeof initialValues,
    formikHelpers: FormikHelpers<typeof initialValues>
  ) => {
    try {
      const response = await approveCode({
        variables: {
          email,
          codeValue: +values.code,
        },
      });

      if (response.data?.approveRecoveryCode) {
        onSuccess();
      }
    } catch (error) {
      await issueCode({ variables: { email } });
      formikHelpers.setErrors({
        code: "Incorrect code. We have sent you another one.",
      });
    }
  };

  return (
    <>
      <h1 className="text-center fw-bold mb-4">Password Recovery</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={codeSchema}
        onSubmit={handleSubmit}
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
              <Form.Label>Recovery code</Form.Label>
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
              Verify Email
            </Button>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default Code;