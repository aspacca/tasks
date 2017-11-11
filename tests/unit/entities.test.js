'use strict'

import Project from '../../app/entities/project'
import Task from '../../app/entities/task'
import TaskList from '../../app/entities/tasklist'
import User from '../../app/entities/user'

const test = require('tape')

test('Unit Project JSON serialization', async function (assert) {
  let project = new Project(1, 'project name', '2,3')
  project = JSON.parse(JSON.stringify(project))

  let expected = {
    projectId: 1,
    name: 'project name',
    taskLists: [2, 3]
  }

  assert.deepLooseEqual(project, expected, 'Project JSON serialzation')
  assert.end()
})

test('Unit Task JSON serialization', async function (assert) {
  let task = new Task(1, 'task title', 2, 3, 4)
  task = JSON.parse(JSON.stringify(task))

  let expected = {
    taskId: 1,
    title: 'task title',
    taskListId: 2,
    projectId: 3
  }

  assert.deepLooseEqual(task, expected, 'Task JSON serialzation')
  assert.end()
})

test('Unit TaskList JSON serialization', async function (assert) {
  let taskList = new TaskList(1, 'tasklist title', 2, '3,4', 5)
  taskList = JSON.parse(JSON.stringify(taskList))

  let expected = {
    taskListId: 1,
    title: 'tasklist title',
    projectId: 2,
    tasks: [3, 4]
  }

  assert.deepLooseEqual(taskList, expected, 'TaskList JSON serialzation')
  assert.end()
})

test('Unit User JSON serialization', async function (assert) {
  let user = new User(1, 'email', 'encrypted password', 'first name', 'last name')
  user = JSON.parse(JSON.stringify(user))

  let expected = {
    userId: 1,
    email: 'email',
    firstName: 'first name',
    lastName: 'last name'
  }

  assert.deepLooseEqual(user, expected, 'User JSON serialzation')
  assert.end()
})
