'use strict'

export default class TaskChange {
  constructor (taskId, title, taskListId) {
    this.taskId = taskId
    this.title = title
    this.fk_tasklist = taskListId
  }
}
