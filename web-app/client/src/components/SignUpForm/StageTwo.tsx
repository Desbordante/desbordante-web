import React, { useState } from "react";
import { Formik } from "formik";
import { Form, Button } from "react-bootstrap";

interface Props {
  onSubmit: (code: { code: string }) => void;
  email: string;
}

const StageTwo: React.FC<Props> = ({ onSubmit, email }) => {
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

  return (
    <>
      <h1 className="text-center fw-bold mb-4">Email Verification</h1>
      <p className="mb-4">
        We have sent the verification code to{" "}
        <span className="fw-bold">{email}</span>
      </p>
      <Formik
        initialValues={initialValues}
        validate={validate}
        onSubmit={onSubmit}
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
                size="lg"
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
