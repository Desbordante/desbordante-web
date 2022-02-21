import React, { useContext } from "react";
import { Formik } from "formik";
import { Container, Form, Button } from "react-bootstrap";
import { countries } from "countries-list";
import { validate as emailValidator } from "email-validator";
import { passwordStrength } from "check-password-strength";

import PopupWindowContainer from "../PopupWindowContainer/PopupWindowContainer";
import { AuthContext } from "../AuthContext";

const SignUpForm = () => {
  const { setIsSignUpShown } = useContext(AuthContext)!;
  const initialValues = {
    fullName: "",
    email: "",
    password: "",
    country: "",
    company: "",
    occupation: "",
  };
  const validate = (values: typeof initialValues) => {
    const errors: any = {};
    if (!values.fullName) {
      errors.fullName = "Required";
    }

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

    if (!values.country) {
      errors.country = "Required";
    }

    if (!values.company) {
      errors.company = "Required";
    }

    if (!values.occupation) {
      errors.occupation = "Required";
    }

    return errors;
  };

  return (
    <PopupWindowContainer onOutsideClick={() => setIsSignUpShown(false)}>
      <Container className="form-container bg-light p-4 m-4 p-sm-5 m-sm-5 rounded-3 w-auto shadow-lg">
        <h1 className="text-center fw-bold mb-4">Sign Up</h1>
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
                <Form.Label>Full name</Form.Label>
                <Form.Control
                  placeholder="John Doe"
                  name="fullName"
                  value={values.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.fullName && !!errors.fullName}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.fullName}
                </Form.Control.Feedback>
              </Form.Group>
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

              <Form.Group className="mb-3">
                <Form.Label>Country</Form.Label>
                <Form.Select
                  placeholder="Russia"
                  name="country"
                  value={values.country}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.country && !!errors.country}
                >
                  <option>Select country</option>
                  {Object.entries(countries).map(([_, value]) => (
                    <option key={value.name}>
                      {value.emoji} {value.native}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.country}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Company / affiliation</Form.Label>
                <Form.Control
                  placeholder="XYZ Widget Company"
                  name="company"
                  value={values.company}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.company && !!errors.company}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.company}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Occupation</Form.Label>
                <Form.Control
                  placeholder="Chief director"
                  name="occupation"
                  value={values.occupation}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.occupation && !!errors.occupation}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.occupation}
                </Form.Control.Feedback>
              </Form.Group>

              <Button
                variant="outline-primary"
                type="submit"
                className="mt-2 w-100"
                disabled={isSubmitting}
              >
                Sign Up
              </Button>
            </Form>
          )}
        </Formik>
      </Container>
    </PopupWindowContainer>
  );
};

export default SignUpForm;
