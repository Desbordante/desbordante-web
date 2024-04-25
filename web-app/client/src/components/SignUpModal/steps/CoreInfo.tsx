import { useMutation } from '@apollo/client';
import { countries } from 'countries-list';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import isEmail from 'validator/lib/isEmail';
import isStrongPassword from 'validator/lib/isStrongPassword';
import Button from '@components/Button';
import { Text } from '@components/Inputs';
import { ControlledSelect } from '@components/Inputs/Select';
import {
  createUser,
  createUserVariables,
} from '@graphql/operations/mutations/__generated__/createUser';
import { CREATE_USER } from '@graphql/operations/mutations/createUser';
import { useAuthContext } from '@hooks/useAuthContext';
import hashPassword from '@utils/hashPassword';
import styles from '../../LogInModal/LogInModal.module.scss';

const countryNames = Object.entries(countries).map(([, country]) => country);

const passwordTooltip = (
  <>
    The password must contain
    <ul>
      <li>at least 8 characters</li>
      <li>at least 1 uppercase letter</li>
      <li>at least 1 lowercase letter</li>
      <li>at least 1 digit</li>
      <li>at least 1 special character</li>
    </ul>
  </>
);

type Inputs = {
  fullName: string;
  email: string;
  password: string;
  country: string;
  company: string;
  occupation: string;
};

const defaultValues: Inputs = {
  fullName: '',
  email: '',
  password: '',
  country: '',
  company: '',
  occupation: '',
};

interface Props {
  onSuccess: () => void;
}

const CoreInfo: FC<Props> = ({ onSuccess }) => {
  const { applyTokens } = useAuthContext();

  const [createUser] = useMutation<createUser, createUserVariables>(
    CREATE_USER,
  );

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({
    defaultValues,
  });
  const onSubmit = handleSubmit(async (values) => {
    onSuccess();
    return
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
    } catch (e) {}
  });

  return (
    <>
      <h4 className={styles.title}>Sign Up</h4>
      <form onSubmit={onSubmit} className={styles.formContainer}>
        <div className={styles.inputGroup}>
          <Text
            label="Full name"
            placeholder="John Doe"
            {...register('fullName', {
              required: 'Required',
              minLength: {
                value: 2,
                message: 'Must be at least 2 characters long',
              },
              maxLength: {
                value: 30,
                message: 'Must be no more than 30 characters long',
              },
            })}
            error={errors.fullName?.message}
          />
          <Text
            label="Email"
            type="email"
            placeholder="your.email@example.com"
            {...register('email', {
              required: 'Required',
              validate: (value) => isEmail(value) || 'Invalid email',
            })}
            error={errors.email?.message}
          />
          <Text
            label="Password"
            type="password"
            tooltip={passwordTooltip}
            placeholder="admin1234"
            {...register('password', {
              required: 'Required',
              validate: (value) => {
                console.log(isStrongPassword(value));
                return (
                  isStrongPassword(value) ||
                  'The password does not match the pattern (see tooltip)'
                );
              },
            })}
            error={errors.password?.message}
          />
          <ControlledSelect
            control={control}
            controlName="country"
            label="Country"
            placeholder="Germany"
            options={countryNames.map(({ emoji, native, name }) => ({
              label: `${emoji} ${native}`,
              value: name,
            }))}
            rules={{
              required: 'Required',
            }}
            error={errors.country?.message}
          />
          <Text
            label="Company / affiliation"
            placeholder="XYZ Widget Company"
            {...register('company', {
              required: 'Required',
              minLength: {
                value: 2,
                message: 'Must be at least 2 characters long',
              },
              maxLength: {
                value: 40,
                message: 'Must be no more than 40 characters long',
              },
            })}
            error={errors.company?.message}
          />
          <Text
            label="Occupation"
            placeholder="Chief director"
            {...register('occupation', {
              required: 'Required',
              minLength: {
                value: 2,
                message: 'Must be at least 2 characters long',
              },
              maxLength: {
                value: 40,
                message: 'Must be no more than 40 characters long',
              },
            })}
            error={errors.occupation?.message}
          />
        </div>

        <div className={styles.buttons}>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            Sign Up
          </Button>
        </div>
      </form>
    </>
  );
};

export default CoreInfo;
