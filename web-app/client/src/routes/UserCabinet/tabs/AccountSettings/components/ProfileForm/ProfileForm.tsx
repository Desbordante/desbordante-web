import { useMutation } from '@apollo/client';
import { countries } from 'countries-list';
import _ from 'lodash';
import { FC, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Button from '@components/Button';
import { Text } from '@components/Inputs';
import { ControlledSelect } from '@components/Inputs/Select';
import {
  updateUser,
  updateUserVariables,
} from '@graphql/operations/mutations/__generated__/updateUser';
import { UPDATE_USER } from '@graphql/operations/mutations/updateUser';
import { getUser_user } from '@graphql/operations/queries/__generated__/getUser';
import styles from './ProfileForm.module.scss';

const countryNames = Object.entries(countries).map(([, country]) => country);

type Inputs = {
  fullName: string;
  country: string;
  companyOrAffiliation: string;
  occupation: string;
};

interface Props {
  user: getUser_user;
}

const ProfileForm: FC<Props> = ({ user }) => {
  const {
    control,
    reset,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>();

  const [updateUser] = useMutation<updateUser, updateUserVariables>(
    UPDATE_USER,
  );

  useEffect(() => {
    reset(
      _.pick(user, [
        'fullName',
        'country',
        'occupation',
        'companyOrAffiliation',
      ]),
    );
  }, [user, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateUser({
        variables: {
          props: values,
        },
      });
      location.reload();
    } catch (e) {}
  });

  return (
    <form onSubmit={onSubmit} className={styles.profileForm}>
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
      <Text label="Email" type="email" value={user.email} disabled />
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
        {...register('companyOrAffiliation', {
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
        error={errors.companyOrAffiliation?.message}
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

      <Button variant="primary" type="submit" disabled={isSubmitting}>
        Update profile
      </Button>
    </form>
  );
};

export default ProfileForm;
