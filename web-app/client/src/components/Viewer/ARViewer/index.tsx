import React, { useState } from "react";
import { Container } from "react-bootstrap";

import ARList from "./ARList";
import Navigation from "../Navigation";
import { ARTaskResult, SortMethod } from "../../../types/taskInfo";
import { AssociationRule } from "../../../types/types";
import TableSnippet from "../TableSnippet/TableSnippet";

const tabs = ["Association Rules", "Dataset"];
const sortMethods: SortMethod<AssociationRule>[] = [
  {
    name: "Support",
    comparator: (t1, t2) => t2.support - t1.support,
  },
  {
    name: "LHS",
    comparator: (t1, t2) => {
      const str1 = t1.lhs.concat(t1.rhs).join("");
      const str2 = t2.lhs.concat(t2.rhs).join("");
      return str1.localeCompare(str2);
    },
  },
  {
    name: "RHS",
    comparator: (t1, t2) => t1.rhs.join("").localeCompare(t2.rhs.join("")),
  },
];

interface Props {
  result: ARTaskResult;
}

const Index: React.FC<Props> = ({ result }) => {
  const [partShown, setPartShown] = useState(0);

  const [selectedRule, setSelectedRule] = useState<AssociationRule | null>(
    null
  );

  // @ts-ignore
  return (
    <Container fluid className="h-100 p-4 flex-grow-1 d-flex flex-column">
      <Navigation
        partShown={partShown}
        setPartShown={setPartShown}
        options={tabs}
      />
      {partShown === 0 && (
        <ARList
          rules={result.ARs}
          sortMethods={sortMethods}
          selectedRule={selectedRule}
          setSelectedRule={setSelectedRule}
        />
      )}
      {partShown === 1 && <TableSnippet selectedColumns={[]} />}
    </Container>
  );
};

export default Index;
