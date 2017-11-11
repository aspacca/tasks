'use strict'

import {
    redisClient,
    projectRedisRepository,
    taskRedisRepository,
    taskListRedisRepository,
    searchRedisRepository
} from './config'

import User from '../../app/entities/user'
import Project from '../../app/entities/project'
import TaskList from '../../app/entities/tasklist'
import Task from '../../app/entities/task'

const test = require('tape-async')

let before = async function () {
  redisClient.flushdb()
}

let after = async function () {
  redisClient.quit()
}

test('Integration Redis Respository', async function (assert) {
  try {
    await before()

    let newProject = new Project(1, 'name', null, 1)
    projectRedisRepository.save(newProject)

    assert.ok(true, 'project cached')

    let project = await projectRedisRepository.getById(1)

    project = JSON.parse(JSON.stringify(project))
    newProject = JSON.parse(JSON.stringify(newProject))

    assert.deepLooseEqual(project, newProject, 'project fetched')

    projectRedisRepository.delete(1)
    project = await projectRedisRepository.getById(1)

    assert.equal(undefined, project, 'project flushed')

    let newTaskList = new TaskList(1, 'title', 1, null, 1)
    taskListRedisRepository.save(newTaskList)

    let taskList = await taskListRedisRepository.getById(1)

    assert.ok(true, 'tasklist cached')

    taskList = JSON.parse(JSON.stringify(taskList))
    newTaskList = JSON.parse(JSON.stringify(newTaskList))

    assert.deepLooseEqual(taskList, newTaskList, 'tasklist fetched')

    taskListRedisRepository.delete(1)
    taskList = await taskListRedisRepository.getById(1)

    assert.equal(undefined, taskList, 'tasklist flushed')

    let newTask = new Task(1, 'name', 1, 1, 1)
    taskRedisRepository.save(newTask)

    assert.ok(true, 'task cached')

    let task = await taskRedisRepository.getById(1)

    task = JSON.parse(JSON.stringify(task))
    newTask = JSON.parse(JSON.stringify(newTask))

    assert.deepLooseEqual(task, newTask, 'task fetched')

    taskRedisRepository.delete(1)
    task = await taskRedisRepository.getById(1)

    assert.equal(undefined, task, 'task flushed')

    let seachInput = [
            { id: 1, type: 'projects', value: 'a projects string' },
            { id: 2, type: 'tasklists', value: 'a tasklists string' },
            { id: 3, type: 'tasks', value: 'a tasks string' }
    ]

    seachInput.forEach(async function (entry, i) {
      searchRedisRepository.push(entry.value, entry.type, entry.id)
    })

    let searchResults = await searchRedisRepository.search('string')

    let sorting = function (a, b) {
      return a.id - b.id
    }

    assert.deepLooseEqual(seachInput.sort(sorting), searchResults.sort(sorting), 'search matches')

    await after()
  } catch (e) {
    await after()
  }

  assert.end()
})
