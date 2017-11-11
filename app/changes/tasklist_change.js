'use strict'

export default class TaskListChange {
  constructor (taskListId, title) {
    this.taskListId = taskListId
    this.title = title
  }
}
