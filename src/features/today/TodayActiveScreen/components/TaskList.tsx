import type { Task } from '@/domain/task/task'
import { TaskItem } from '@/shared/ui/TaskItem/TaskItem'
import styles from './TaskList.module.css'

export interface TaskListProps {
  tasks: Task[]
  onToggleTask: (id: string) => void
}

export function TaskList({ tasks, onToggleTask }: TaskListProps) {
  return (
    <ul className={styles.list}>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          title={task.title}
          completed={task.completed}
          onToggle={() => {
            onToggleTask(task.id)
          }}
        />
      ))}
    </ul>
  )
}
