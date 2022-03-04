import React, { useContext } from "react";
import { Container } from "react-bootstrap";
import { useHistory } from "react-router-dom";

import Toggle from "../Toggle/Toggle";
import Button from "../Button/Button";
import { TaskContext } from "../TaskContext";

interface Props {
  partShown: number;
  setPartShown: React.Dispatch<React.SetStateAction<number>>;
  options: string[];
}

const Navigation: React.FC<Props> = ({ partShown, setPartShown, options }) => {
  const { resetTask, deleteTask } = useContext(TaskContext)!;
  const history = useHistory();

  return (
    <Container
      fluid
      className="d-flex flex-wrap align-items-center mb-2 position-sticky"
    >
      <h3 className="mx-2 fw-bold">Display</h3>
      {options.map((option, index) => (
        <Toggle
          key={option}
          toggleCondition={partShown === index}
          variant="dark"
          onClick={() => setPartShown(index)}
          className="mx-2"
        >
          {option}
        </Toggle>
      ))}
      <Button
        variant="outline-danger"
        className="ms-auto justify-self-end"
        onClick={async () => {
          await deleteTask();
          resetTask();
          history.push("/");
        }}
      >
        Delete Task
      </Button>
    </Container>
  );
};

export default Navigation;
