import React, { useContext } from "react";
import { Formik, FormikHelpers } from "formik";
import { Form, Button } from "react-bootstrap";
import { validate as emailValidator } from "email-validator";
import { passwordStrength } from "check-password-strength";
import { useMutation } from "@apollo/client";
import * as Yup from "yup";

import {
  logIn,
  logInVariables,
} from "../../graphql/operations/mutations/__generated__/logIn";
import { LOG_IN } from "../../graphql/operations/mutations/logIn";
import hashPassword from "../../functions/hashPassword";
import { AuthContext } from "../AuthContext";

const logInSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string()
    .test("strong-enough", "Too weak!", (value?: string) =>
      Boolean(value && passwordStrength(value).id !== 0)
    )
    .required("Required"),
});

interface Props {
  onSuccess: () => void;
}

const StageOne: React.FC<Props> = ({ onSuccess }) => {
  const { applyTokens } = useContext(AuthContext)!;

  const initialValues = {
    email: "",
    password: "",
  };

  const [logIn] = useMutation<logIn, logInVariables>(LOG_IN);

  const handleSubmit = async (
    values: typeof initialValues,
    formikHelpers: FormikHelpers<typeof initialValues>
  ) => {
    try {
      const response = await logIn({
        variables: {
          email: values.email,
          pwdHash: hashPassword(values.password),
        },
      });

      if (response.data?.logIn) {
        applyTokens(response.data.logIn);
        onSuccess();
      }
    } catch (error) {
      formikHelpers.setErrors({
        email: "Incorrect data",
        password: "Incorrect data",
      });
    }
  };

  return (
    <>
      <h1 className="text-center fw-bold mb-4">Log In</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={logInSchema}
        /* eslint-disable-next-line no-console */
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
              <Form.Label>Email</Form.Label>
              <Form.Control
                placeholder="your.email@example.com"
                name="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={touched.email && !!errors.email}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                placeholder="admin1234"
                name="password"
                type="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={touched.password && !!errors.password}
              />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group>

            <Button
              variant="outline-primary"
              type="submit"
              className="mt-2 w-100"
              disabled={isSubmitting}
            >
              Log In
            </Button>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default StageOne;
