import { FC } from 'react';
import { useForm } from 'react-hook-form';
import Button from '@components/Button';
import Password from './Password';

type Inputs = {
  password: string;
};

const defaultValues: Inputs = {
  password: '',
};

export const TestPassword: FC = () => {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<Inputs>({
    defaultValues,
  });

  const onSubmit = handleSubmit(async () => {
    console.log('submit');
  });

  return (
    <>
      <form onSubmit={onSubmit}>
        <Password
          control={control}
          controlName="password"
          label="Password"
          placeholder="admin1234"
          rules={{ required: 'Required' }}
        />
        <Button
          variant="primary"
          type="submit"
          disabled={isSubmitting}
          role="submit"
        >
          Test Button
        </Button>
      </form>
    </>
  );
};
