import { useMutation } from '@apollo/client';
import { passwordStrength } from 'check-password-strength';
import { Formik, FormikHelpers } from 'formik';
import React from 'react';
import { Form, Button } from 'react-bootstrap';
import * as Yup from 'yup';

import {
  issueCodeForPasswordRecovery,
  issueCodeForPasswordRecoveryVariables,
} from '../../../graphql/operations/mutations/__generated__/issueCodeForPasswordRecovery';
import { ISSUE_CODE_FOR_PASSWORD_RECOVERY } from '../../../graphql/operations/mutations/issueCodeForPasswordRecovery';

const logInSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
});

interface Props {
  onSuccess: () => void;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
}

const Email: React.FC<Props> = ({ onSuccess, email, setEmail }) => {
  const initialValues = {
    email,
  };

  const [issueCode] = useMutation<
    issueCodeForPasswordRecovery,
    issueCodeForPasswordRecoveryVariables
  >(ISSUE_CODE_FOR_PASSWORD_RECOVERY);

  const handleSubmit = async (
    values: typeof initialValues,
    formikHelpers: FormikHelpers<typeof initialValues>
  ) => {
    try {
      const response = await issueCode({
        variables: {
          email: values.email,
        },
      });

      if (response.data?.issueCodeForPasswordRecovery) {
        setEmail(values.email);
        onSuccess();
      }
    } catch (error) {
      formikHelpers.setErrors({
        email: 'Incorrect data',
      });
    }
  };

  return (
    <>
      <h1 className="text-center fw-bold mb-4">Password Recovery</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={logInSchema}
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
            <Button
              variant="outline-primary"
              type="submit"
              className="mt-2 w-100"
              disabled={isSubmitting}
            >
              Send Verification Code
            </Button>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default Email;
