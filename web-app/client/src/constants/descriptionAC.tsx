import { FC } from 'react';

const DescriptionAC: FC = () => {
  return (
    <>
      Simply put, algebraic constraint is a relation between two columns, such
      that some binary operation b = {'{ +, -, /, * }'} (applied to each row)
      has most of its results within several ranges. For example, an algebraic
      constraint for a table containing ShipDate and DeliveryDate columns with b
      = {'{ - }'} will result in three clusters defined by a shipping method. In
      this scenario outliers will be rows with rare events such as dockers
      strike, typo in address, etc. This task discovers all algebraic
      constraints for a specified operation and a provided table. Also, it
      detects and visualizes outlier rows. For more information check{' '}
      <a href="https://vldb.org/conf/2003/papers/S20P03.pdf">
        “BHUNT: Automatic Discovery of Fuzzy Algebraic Constraints in Relational
        Data”
      </a>{' '}
      by P.G. Brown and P.J. Haas.
    </>
  );
};

export default DescriptionAC;
