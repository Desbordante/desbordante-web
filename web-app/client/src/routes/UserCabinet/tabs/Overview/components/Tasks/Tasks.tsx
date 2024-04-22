import { FC } from 'react';
import TaskItem from '@components/TaskItem';
import { getUser_user_tasks_data } from '@graphql/operations/queries/__generated__/getUser';
import styles from './Tasks.module.scss';

interface Props {
  tasks: getUser_user_tasks_data[] | null;
}

const Tasks: FC<Props> = ({ tasks }) => {
  return (
    <section className={styles.tasksSection}>
      <h5 className={styles.title}>Tasks</h5>
      <ul className={styles.taskList}>
        {tasks?.map((task) => <TaskItem data={task} key={task.taskID} />)}
      </ul>
    </section>
  );
};

export default Tasks;
