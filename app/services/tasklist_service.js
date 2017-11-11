'use strict'

import TaskList from '../entities/tasklist'

export default class TaskListService {
  constructor (
        taskListMysqlRepository,
        taskListRedisRepository
    ) {
    this.taskListMysqlRepository = taskListMysqlRepository
    this.taskListRedisRepository = taskListRedisRepository
  }

  async getTaskList (taskListId) {
    let taskList = await this.taskListRedisRepository.getById(taskListId)
    if (!taskList) {
      taskList = await this.taskListMysqlRepository.getById(taskListId)
      if (taskList && taskList.taskListId) {
        this.taskListRedisRepository.save(taskList)
      }
    }

    return taskList
  }

  async applyChanges (taskListChange) {
    this.taskListRedisRepository.delete(taskListChange.taskListId)
    let res = await this.taskListMysqlRepository.update(taskListChange)

    return res
  }

  async createNew (req) {
    let taskList = new TaskList(null, req.title, req.project_id, null, req.authUserId)
    let taskListId = await this.taskListMysqlRepository.save(taskList)
    if (!taskListId) {
      return
    }

    taskList.taskListId = taskListId
    taskList = JSON.parse(JSON.stringify(taskList))

    this.taskListRedisRepository.save(taskList)

    return taskListId
  }
}
