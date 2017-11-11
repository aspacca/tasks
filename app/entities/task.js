'use strict'

export default class Task {
  constructor (taskId, title, taskListId, projectId, userId) {
    this.taskId = taskId
    this.title = title
    this.taskListId = taskListId
    this.projectId = projectId
    this.userId = userId
  }

  toJSON () {
    return {
      taskId: this.taskId,
      title: this.title,
      taskListId: this.taskListId,
      projectId: this.projectId
    }
  }
}
