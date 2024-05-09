import { FC, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import ListPropertiesModal from '@components/common/layout/ListPropertiesModal';
import { Checkbox } from '@components/common/uikit/Inputs';

type FilteringProps = {
  setIsFilteringShown: (arg: boolean) => void;
};

export const FilteringWindow: FC<FilteringProps> = ({
  setIsFilteringShown,
}) => {
  const { watch, setValue } = useFormContext();
  const initialShowKeys = watch('showKeys') as boolean;
  const [showKeys, setShowKeys] = useState(initialShowKeys);

  return (
    <ListPropertiesModal
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
