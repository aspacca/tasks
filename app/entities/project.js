'use strict'

export default class Project {
  constructor (projectId, name, taskLists, userId) {
    this.projectId = projectId
    this.name = name
    this.taskLists = taskLists
    this.userId = userId
  }

  set taskLists (taskLists) {
    this._taskLists = taskLists ? taskLists.split(',') : []
  }

  get taskLists () {
    return this._taskLists
  }

  toJSON () {
    return {
      projectId: this.projectId,
      name: this.name,
      taskLists: this.taskLists
    }
  }
}
