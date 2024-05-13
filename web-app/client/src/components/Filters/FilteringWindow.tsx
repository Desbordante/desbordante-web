import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Checkbox } from '@components/Inputs';
import ListPropertiesModal from '@components/ListPropertiesModal';

type FilteringProps = {
  isFilteringShown: boolean;
  setIsFilteringShown: Dispatch<SetStateAction<boolean>>;
};

export const FilteringWindow: FC<FilteringProps> = ({
  isFilteringShown,
  setIsFilteringShown,
}) => {
  const { watch, setValue } = useFormContext();
  const initialShowKeys = watch('showKeys') as boolean;
  const [showKeys, setShowKeys] = useState(initialShowKeys);

  return (
    <ListPropertiesModal
      isOpen={isFilteringShown}
      setIsOpen={setIsFilteringShown}
      name="Filters"
      onClose={() => {
        setShowKeys(initialShowKeys);
        setIsFilteringShown(false);
      }}
      onApply={() => {
        setValue('showKeys', showKeys);
        setIsFilteringShown(false);
      }}
    >
      <Checkbox
        label="Show dependencies containing keys"
        checked={showKeys}
        onChange={() => setShowKeys((prev) => !prev)}
      />
    </ListPropertiesModal>
  );
};

export default FilteringWindow;
