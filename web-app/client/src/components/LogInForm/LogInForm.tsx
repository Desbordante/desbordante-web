import React, { useContext } from "react";
import { Formik } from "formik";
import { Container, Form, Button } from "react-bootstrap";
import { validate as emailValidator } from "email-validator";
import { passwordStrength } from "check-password-strength";

import PopupWindowContainer from "../PopupWindowContainer/PopupWindowContainer";
import { AuthContext } from "../AuthContext";

const LogInForm = () => {
  const { setIsLogInShown } = useContext(AuthContext)!;
  const initialValues = {
    email: "",
    password: "",
  };
  const validate = (values: typeof initialValues) => {
    const errors: any = {};

    if (!values.email) {
      errors.email = "Required";
    } else if (!emailValidator(values.email)) {
      errors.email = "Incorrect email";
    }

    if (!values.password) {
      errors.password = "Required";
    } else if (passwordStrength(values.password).id === 0) {
      errors.password = "Password is too weak";
    }

    return errors;
  };

  return (
    <PopupWindowContainer onOutsideClick={() => setIsLogInShown(false)}>
      <Container className="form-container bg-light p-4 m-4 p-sm-5 m-sm-5 rounded-3 w-auto shadow-lg">
        <h1 className="text-center fw-bold mb-4">Log In</h1>
        <Formik
          initialValues={initialValues}
          validate={validate}
          /* eslint-disable-next-line no-console */
          onSubmit={console.log}
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
      </Container>
    </PopupWindowContainer>
  );
};

export default LogInForm;
