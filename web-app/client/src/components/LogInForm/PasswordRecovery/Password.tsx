import { useMutation } from '@apollo/client';
import { passwordStrength } from 'check-password-strength';
import { Formik, FormikHelpers } from 'formik';
import React, { useContext } from 'react';
import { Form, Button } from 'react-bootstrap';
import * as Yup from 'yup';

import {
  changePassword,
  changePasswordVariables,
} from '../../../graphql/operations/mutations/__generated__/changePassword';
import { CHANGE_PASSWORD } from '../../../graphql/operations/mutations/changePassword';
import { AuthContext } from '../../AuthContext';

const logInSchema = Yup.object().shape({
  password: Yup.string()
    .test('strong-enough', 'Too weak!', (value?: string) =>
      Boolean(value && passwordStrength(value).id !== 0)
    )
    .required('Required'),
});

interface Props {
  email: string;
  onSuccess: () => void;
}

const Password: React.FC<Props> = ({ onSuccess, email }) => {
  const { applyTokens } = useContext(AuthContext)!;

  const initialValues = {
    password: '',
  };

  const [changePassword] = useMutation<changePassword, changePasswordVariables>(
    CHANGE_PASSWORD
  );

  const handleSubmit = async (
    values: typeof initialValues,
    formikHelpers: FormikHelpers<typeof initialValues>
  ) => {
    try {
      const response = await changePassword({
        variables: {
          email,
          newPwdHash: values.password,
        },
      });

      // eslint-disable-next-line no-underscore-dangle
      if (response.data?.changePassword.__typename === 'TokenPair') {
        applyTokens(response.data?.changePassword);
        onSuccess();
      }
    } catch (error: any) {
      formikHelpers.setErrors({
        password: error.message,
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
              <Form.Label>New password</Form.Label>
              <Form.Control
                placeholder="1234"
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
              Update Password
            </Button>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default Password;
