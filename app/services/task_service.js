'use strict'

import Task from '../entities/task'

export default class TaskService {
  constructor (
        taskMysqlRepository,
        taskRedisRepository
    ) {
    this.taskMysqlRepository = taskMysqlRepository
    this.taskRedisRepository = taskRedisRepository
  }

  async getTask (taskId) {
    let task = await this.taskRedisRepository.getById(taskId)
    if (!task) {
      task = await this.taskMysqlRepository.getById(taskId)
      if (task && task.taskId) {
        this.taskRedisRepository.save(task)
      }
    }

    return task
  }

  async applyChanges (taskChange) {
    this.taskRedisRepository.delete(taskChange.taskId)
    let res = await this.taskMysqlRepository.update(taskChange)

    return res
  }

  async createNew (req) {
    let task = new Task(null, req.title, req.tasklist_id, null, req.authUserId)
    let taskId = await this.taskMysqlRepository.save(task)
    if (!taskId) {
      return
    }

    task.taskId = taskId
    task = JSON.parse(JSON.stringify(task))

    this.taskRedisRepository.save(task)

    return taskId
  }
}
