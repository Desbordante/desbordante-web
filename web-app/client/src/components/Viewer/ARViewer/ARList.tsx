import React, { useState, useEffect } from "react";
import { Container, Stack } from "react-bootstrap";

import SearchBar from "../../SearchBar/SearchBar";
import Selector from "../../Selector/Selector";
import { SortMethod } from "../../../types/taskInfo";
import ARSnippet from "./ARSnippet";
import { AssociationRule } from "../../../types/types";

interface Props {
  selectedRule: AssociationRule | null;
  setSelectedRule: React.Dispatch<React.SetStateAction<AssociationRule | null>>;
  rules: AssociationRule[];
  sortMethods: SortMethod<AssociationRule>[];
  className?: string;
}

const ARList: React.FC<Props> = ({
  selectedRule,
  setSelectedRule,
  rules,
  sortMethods,
  className = "",
}) => {
  const [sortedRules, setSortedRules] = useState<AssociationRule[]>([]);
  const [currentSortMethod, setCurrentSortMethod] = useState<
    SortMethod<AssociationRule>
  >(sortMethods[0]);
  const [searchString, setSearchString] = useState("");

  // update displayed rules on search
  useEffect(() => {
    const foundRules = searchString
      ? rules.filter((rule) =>
          rule.lhs
            .concat(rule.rhs)
            .join("")
            .toLowerCase()
            .includes(searchString.toLowerCase())
        )
      : [...rules];

    // sort found dependencies
    const newSortedRules = foundRules.sort(currentSortMethod.comparator);
    setSortedRules(newSortedRules);
  }, [rules, searchString, currentSortMethod]);

  return (
    <Container fluid className={`flex-grow-1 d-flex flex-column ${className}`}>
      <Container fluid className="d-flex flex-wrap align-items-center p-0 my-2">
        <h3 className="mx-2 fw-bold">Sort by</h3>
        <Selector
          options={sortMethods}
          current={currentSortMethod}
          onSelect={setCurrentSortMethod}
          label={(sortMethod) => sortMethod.name}
          variant="dark"
          className="mx-2"
        />
        <SearchBar
          defaultText="Filter dependencies"
          onChange={setSearchString}
          className="mx-2"
        />
      </Container>
      <Stack className="my-2 w-100">
        {sortedRules.map((rule, index) => (
          <ARSnippet
            rule={rule}
            key={index}
            onActiveClick={() => {
              setSelectedRule(null);
            }}
            onClick={() => setSelectedRule(rule)}
            isActive={JSON.stringify(rule) === JSON.stringify(selectedRule)}
          />
        ))}
      </Stack>
    </Container>
  );
};

export default ARList;
