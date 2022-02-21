import React, { useContext } from "react";
import { Formik } from "formik";
import { Container, Form, Button } from "react-bootstrap";
import { validate as emailValidator } from "email-validator";

import { AuthContext } from "../AuthContext";
import StarRatingPicker from "./StarRatingPicker";
import PopupWindowContainer from "../PopupWindowContainer/PopupWindowContainer";

const maxCharactersInFeedback = 2500;

const FeedbackForm = () => {
  const { user, setIsFeedbackShown } = useContext(AuthContext)!;
  const initialValues = {
    fullName: user ? user.name : "",
    email: user ? user.email : "",
    rating: 4,
    feedback: "",
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
    if (!values.feedback) {
      errors.feedback = "Required";
    }

    return errors;
  };

  return (
    <PopupWindowContainer onOutsideClick={() => setIsFeedbackShown(false)}>
      <Container className="form-container bg-light p-4 m-4 p-sm-5 m-sm-5 rounded-3 w-auto shadow-lg">
        <h1 className="text-center fw-bold mb-4">Send Feedback</h1>
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
            setValues,
          }) => (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Full name</Form.Label>
                <Form.Control
                  placeholder="John Doe"
                  name="fullName"
                  value={values.fullName}
                  onChange={handleChange}
                  disabled={!!user}
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
                  disabled={!!user}
                  onBlur={handleBlur}
                  isInvalid={touched.email && !!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Rating</Form.Label>
                <StarRatingPicker
                  max={5}
                  rating={values.rating}
                  onChange={(rating) => setValues({ ...values, rating })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Feedback message</Form.Label>
                <Form.Control
                  placeholder="Type your feedback here"
                  as="textarea"
                  name="feedback"
                  maxLength={maxCharactersInFeedback}
                  value={values.feedback}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.feedback && !!errors.feedback}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.feedback}
                </Form.Control.Feedback>
                <Form.Text className="text-dull">
                  {maxCharactersInFeedback - values.feedback.length} characters
                  remaining
                </Form.Text>
              </Form.Group>

              <Button
                variant="outline-primary"
                type="submit"
                className="mt-2 w-100"
                disabled={isSubmitting}
              >
                Send Feedback
              </Button>
            </Form>
          )}
        </Formik>
      </Container>
    </PopupWindowContainer>
  );
};

export default FeedbackForm;
