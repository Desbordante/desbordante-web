import React, { useContext } from "react";
import { Container } from "react-bootstrap";
import { useHistory } from "react-router-dom";

import Toggle from "../Toggle/Toggle";
import Button from "../Button/Button";
import { TaskContext } from "../TaskContext";
import { ErrorContext } from "../ErrorContext";
import { AuthContext } from "../AuthContext";

interface Props {
  partShown: number;
  setPartShown: React.Dispatch<React.SetStateAction<number>>;
  options: string[];
}

const Navigation: React.FC<Props> = ({ partShown, setPartShown, options }) => {
  const { resetTask, deleteTask } = useContext(TaskContext)!;
  const { showError } = useContext(ErrorContext)!;
  const { user } = useContext(AuthContext)!;
  const history = useHistory();

  const handleDeleteTask = async () => {
    try {
      await deleteTask();
      resetTask();
      history.push("/");
    } catch (error: any) {
      showError(error);
    }
  };

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
      {user?.permissions.canUploadFiles && (
        <Button
          variant="outline-danger"
          className="ms-auto justify-self-end"
          onClick={handleDeleteTask}
        >
          Delete Task
        </Button>
      )}
    </Container>
  );
};

export default Navigation;
