import React, {useContext} from "react";
import {sentenceCase} from "change-case";
import {OverlayTrigger, Tooltip} from "react-bootstrap";

import {TaskContext} from "../TaskContext";
import {TaskProperties} from "../../types/taskInfo";

interface Props {
  taskProperties?: TaskProperties;
}

const Overlay: React.FC<Props> = ({taskProperties}) => (
  taskProperties ?
    <>
      <p className="mb-0">Algorithm: {taskProperties.algorithmName}</p>
      {Object.entries(taskProperties.specificConfig).map(([key, value]) => (
        key !== "__typename" && <p className="mb-0" key={key}>{sentenceCase(key)}: {value}</p>
      ))}
    </> : <p>No task information currently available</p>

);


const TaskConfig = () => {
  const {taskProperties} = useContext(TaskContext)!;

  return (<OverlayTrigger placement="bottom"
                          overlay={<Tooltip className="p-3"><Overlay taskProperties={taskProperties}/></Tooltip>}>
    <i className="bi bi-info-circle mx-1"/>
  </OverlayTrigger>);
};

export default TaskConfig;