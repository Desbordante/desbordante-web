import Button from '@components/Button';
import OrderingWindow from '@components/Filters/OrderingWindow';
import { Icon } from '@components/IconComponent';
import { Checkbox, NumberInput, Select, Text } from '@components/Inputs';
import ModalContainer from '@components/ModalContainer';
import Tooltip from '@components/Tooltip';
import {
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { NextSeo } from 'next-seo';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { PrimitiveType } from 'types/globalTypes';
import styles from './test.module.scss';
import CoreInfo from '@components/SignUpModal/steps/CoreInfo';
import EmailVerification from '@components/SignUpModal/steps/EmailVerification';
import { useAuthContext } from '@hooks/useAuthContext';
import useModal from '@hooks/useModal';
import AuthSuccessModal from '@components/AuthSuccessModal';
import { FormProvider } from 'react-hook-form';
import _ from 'lodash';
import { OrderingTitles } from '@constants/titles';
import SelectNew from '@components/SelectNew/SelectCopy';

const ViewIcons: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOrderingShown, setIsOrderingShown] = useState(false);

  const orderingOptions = _.mapValues(
    OrderingTitles[PrimitiveType.CFD],
    (k: string, v: string) => ({
      label: k,
      value: v,
    }),
  );

  const selectOptions = [
    'Red',
    'Orange',
    'Yellow',
    'Green',
    'Grey',
    'Cyan',
    'Blue',
    'Purple',
    'Pink',
    'Maroon',
    'Black',
    'White',
  ];

  return (
    <>
      <NextSeo title="Test" />
      <Icon name="backgroundReports" className={styles.background} />

      <div className={styles.padding}>
        <Button
          variant="primary"
          size="md"
          icon={<Icon name="ordering" />}
          onClick={() => setIsOpen(true)}
        >
          123
        </Button>
        {/*<AuthSuccessModal
          onClose={() => console.log('Closed')}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
  />*/}
        <ModalContainer isOpen={isOpen} setIsOpen={setIsOpen}>
          <div className={styles.cont}>
            <SelectNew options={selectOptions} />
            <Select label="1234" options={_.values(orderingOptions)} />
            <Tooltip>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
            </Tooltip>
          </div>
          <Tooltip>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </Tooltip>
        </ModalContainer>

        <Tooltip>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </Tooltip>
        <Select label="1234" options={_.values(orderingOptions)} />
      </div>
    </>
  );
};

export default ViewIcons;
