import { NextRouter } from 'next/router';
import IdeaIcon from '@assets/icons/idea.svg?component';
import Button from '@components/common/uikit/Button';

const FormFooter = (router: NextRouter, onSubmit: () => Promise<void>) => (
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
    <Button variant="primary" icon={<IdeaIcon />} onClick={onSubmit}>
      Analyze
    </Button>
  </>
);

export default FormFooter;
