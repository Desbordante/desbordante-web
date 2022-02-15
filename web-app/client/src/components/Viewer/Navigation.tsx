import React, { useContext } from "react";
import { Container } from "react-bootstrap";
import { useHistory } from "react-router-dom";

import Toggle from "../Toggle/Toggle";
import Button from "../Button/Button";
import { TaskContext } from "../TaskContext/TaskContext";

interface Props {
  partShown: number;
  setPartShown: React.Dispatch<React.SetStateAction<number>>;
}

const Navigation: React.FC<Props> = ({ partShown, setPartShown }) => {
  const { resetTask, deleteTask } = useContext(TaskContext)!;
  const history = useHistory();

  return (
    <Container
      fluid
      className="d-flex flex-wrap align-items-center mb-2 position-sticky"
    >
      <h3 className="mx-2 fw-bold">Display</h3>
      <Toggle
        toggleCondition={partShown === 0}
        variant="dark"
        onClick={() => setPartShown(0)}
        className="mx-2"
      >
        Attributes
      </Toggle>
      <Toggle
        toggleCondition={partShown === 1}
        variant="dark"
        onClick={() => setPartShown(1)}
        className="mx-2"
      >
        Dependencies
      </Toggle>
      <Toggle
        toggleCondition={partShown === 2}
        variant="dark"
        onClick={() => setPartShown(2)}
        className="mx-2"
      >
        Dataset
      </Toggle>
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
