import React, { useContext, useState } from "react";
import { Formik, FormikHelpers } from "formik";
import { Form, Button, InputGroup } from "react-bootstrap";
import { countries } from "countries-list";
import { passwordStrength } from "check-password-strength";
import { useMutation } from "@apollo/client";
import * as Yup from "yup";

import { SignUpFormProps } from "../../types/types";
import { CREATE_USER } from "../../graphql/operations/mutations/createUser";
import {
  createUser,
  createUserVariables,
} from "../../graphql/operations/mutations/__generated__/createUser";
import hashPassword from "../../functions/hashPassword";
import { AuthContext } from "../AuthContext";

const countryNames = Object.entries(countries).map(([_, country]) => country);

const SignupSchema = Yup.object().shape({
  fullName: Yup.string()
    .min(2, "Too short!")
    .max(30, "Too long!")
    .required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string()
    .test("strong-enough", "Too weak!", (value?: string) =>
      Boolean(value && passwordStrength(value).id !== 0)
    )
    .required("Required"),
  country: Yup.string().required("Required"),
  company: Yup.string()
    .min(2, "Too short!")
    .max(40, "Too long!")
    .required("Required"),
  occupation: Yup.string()
    .min(2, "Too short!")
    .max(40, "Too long!")
    .required("Required"),
});

interface Props {
  onSuccess: () => void;
}

const StageOne: React.FC<Props> = ({ onSuccess }) => {
  const { applyTokens } = useContext(AuthContext)!;
  const [isPasswordShown, setIsPasswordShown] = useState(false);

  const switchIsPasswordShown = () => setIsPasswordShown((prev) => !prev);

  const initialValues: SignUpFormProps = {
    fullName: "",
    email: "",
    password: "",
    country: "",
    company: "",
    occupation: "",
  };

  const [createUser] = useMutation<createUser, createUserVariables>(
    CREATE_USER
  );

  const handleSubmit = async (
    values: SignUpFormProps,
    formikHelpers: FormikHelpers<SignUpFormProps>
  ) => {
    try {
      const response = await createUser({
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
      });

      if (response.data?.createUser) {
        applyTokens(response.data.createUser.tokens);
        onSuccess();
      }
    } catch (error) {
      formikHelpers.setErrors({ email: "This email is already used" });
    }
  };

  return (
    <>
      <h1 className="text-center fw-bold mb-4">Sign Up</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={SignupSchema}
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
              <InputGroup>
                <Form.Control
                  placeholder="admin1234"
                  name="password"
                  type={isPasswordShown ? "text" : "password"}
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.password && !!errors.password}
                />
                <Button
                  variant="outline-primary"
                  onClick={switchIsPasswordShown}
                  className="rounded-end"
                >
                  {isPasswordShown ? (
                    <i className="bi bi-eye-slash" />
                  ) : (
                    <i className="bi bi-eye-fill" />
                  )}
                </Button>
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
              </InputGroup>
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
                {countryNames.map((value) => (
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
    </>
  );
};

export default StageOne;
