export interface Task {
  id: string
  title: string
  completed: boolean
}

// crypto.randomUUID()はSecure Context（https / localhost）限定で、LAN上のhttp
// （実機を開発サーバーへ直接つないだ場合等）ではundefinedになり例外を投げる。
// task.idは本物のUUIDである必要が無いため、一意な文字列を生成するだけのfallbackにする。
function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

export function createTask(title: string, id: string = createId()): Task {
  return { id, title, completed: false }
}

export function toggleTaskCompletion(task: Task): Task {
  return { ...task, completed: !task.completed }
}

export function updateTaskTitle(task: Task, title: string): Task {
  return { ...task, title }
}
