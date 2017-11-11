'use strict'

export default class TaskList {
  constructor (taskListId, title, projectId, tasks, userId) {
    this.taskListId = taskListId
    this.title = title
    this.projectId = projectId
    this.tasks = tasks
    this.userId = userId
  }

  set tasks (tasks) {
    this._tasks = tasks ? tasks.split(',') : []
  }

  get tasks () {
    return this._tasks
  }

  toJSON () {
    return {
      taskListId: this.taskListId,
      title: this.title,
      projectId: this.projectId,
      tasks: this.tasks
    }
  }
}
