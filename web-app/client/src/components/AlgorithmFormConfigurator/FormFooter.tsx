import { NextRouter } from 'next/router';
import React from 'react';
import IdeaIcon from '@assets/icons/idea.svg?component';
import Button from '@components/Button';

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
