import { useRouter } from 'next/router';
import IdeaIcon from '@assets/icons/idea.svg?component';
import Button from '@components/common/uikit/Button';

const FormFooter = () => {
  const router = useRouter();

  return (
    <>
      <Button
        variant="secondary"
        onClick={() =>
          router.push({
            pathname: '/create-task/choose-file',
            query: router.query,
          })
        }
      >
        Go Back
      </Button>
      <Button
        variant="primary"
        icon={<IdeaIcon />}
        type="submit"
        form="algorithmconfigurator"
      >
        Analyze
      </Button>
    </>
  );
};

export default FormFooter;
