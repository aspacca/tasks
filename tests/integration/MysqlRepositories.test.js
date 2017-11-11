'use strict'

import {
    mysqlPool,
    projectMysqlRepository,
    taskMysqlRepository,
    taskListMysqlRepository,
    userMysqlRepository
} from './config'

import User from '../../app/entities/user'
import Project from '../../app/entities/project'
import TaskList from '../../app/entities/tasklist'
import Task from '../../app/entities/task'

import ProjectChange from '../../app/changes/project_change'
import TaskListChange from '../../app/changes/tasklist_change'
import TaskChange from '../../app/changes/task_change'
import UserChange from '../../app/changes/user_change'

const test = require('tape-async')

let before = async function () {
  await mysqlPool.query('DROP TABLE IF EXISTS task')
  await mysqlPool.query('DROP TABLE IF EXISTS tasklist')
  await mysqlPool.query('DROP TABLE IF EXISTS project')
  await mysqlPool.query('DROP TABLE IF EXISTS user')

  await mysqlPool.query('CREATE TABLE user (\n' +
        '    id_user INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,\n' +
        '    email VARCHAR(255) NOT NULL,\n' +
        '    first_name VARCHAR(255) NOT NULL,\n' +
        '    last_name VARCHAR(255) NOT NULL,\n' +
        '    encrypted_password CHAR(60) NOT NULL,\n' +
        '    UNIQUE KEY(email)\n' +
        ') ENGINE=InnoDB;')

  await mysqlPool.query('CREATE TABLE project (\n' +
        '    id_project INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,\n' +
        '    name VARCHAR(255) NOT NULL,\n' +
        '    fk_user INT(10) NOT NULL,\n' +
        '    CONSTRAINT project_fk_user FOREIGN KEY (fk_user) REFERENCES user(id_user)\n' +
        ') ENGINE=InnoDB;')

  await mysqlPool.query('CREATE TABLE tasklist (\n' +
        '    id_tasklist INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,\n' +
        '    title VARCHAR(255) NOT NULL,\n' +
        '    fk_project INT(10) NOT NULL,\n' +
        '    fk_user INT(10) NOT NULL,\n' +
        '    CONSTRAINT tasklist_fk_project FOREIGN KEY (fk_project) REFERENCES project(id_project),\n' +
        '    CONSTRAINT tasklist_fk_user FOREIGN KEY (fk_user) REFERENCES user(id_user)\n' +
        ') ENGINE=InnoDB;')

  await mysqlPool.query('CREATE TABLE task (\n' +
        '    id_task INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,\n' +
        '    title VARCHAR(255) NOT NULL,\n' +
        '    fk_tasklist INT(10) NOT NULL,\n' +
        '    fk_user INT(10) NOT NULL,\n' +
        '    CONSTRAINT task_fk_tasklist FOREIGN KEY (fk_tasklist) REFERENCES tasklist(id_tasklist),\n' +
        '    CONSTRAINT task_fk_user FOREIGN KEY (fk_user) REFERENCES user(id_user)\n' +
        ') ENGINE=InnoDB;')
}

let after = async function () {
  mysqlPool.end()
}

test('Integration Mysql Respository', async function (assert) {
  try {
    await before()

    let newUser = new User(null, 'email', 'password', 'first name', 'last name')
    let userId = await userMysqlRepository.save(newUser)

    assert.ok(userId, 'user created')

    newUser.userId = userId
    let user = await userMysqlRepository.getByEmail('email')

    assert.deepEqual(user, newUser, 'user fetched')

    let userChange = new UserChange(userId, 'new email')
    let userIsUpdated = await userMysqlRepository.update(userChange)

    assert.true(userIsUpdated, 'user updated')

    newUser.email = 'new email'
    let updatedUser = await userMysqlRepository.getById(userId)

    assert.deepEqual(updatedUser, newUser, 'user matches')

    let newProject = new Project(null, 'name', null, userId)
    let projectId = await projectMysqlRepository.save(newProject)

    assert.ok(projectId, 'project created')

    newProject.projectId = projectId
    let project = await projectMysqlRepository.getById(projectId)

    assert.deepEqual(project, newProject, 'project fetched')

    let projectChange = new ProjectChange(projectId, 'new name')
    let projectIsUpdated = await projectMysqlRepository.update(projectChange)

    assert.true(projectIsUpdated, 'project updated')

    newProject.name = 'new name'
    let updatedProject = await projectMysqlRepository.getById(projectId)

    assert.deepEqual(updatedProject, newProject, 'project matches')

    let newTaskList = new TaskList(null, 'title', projectId, null, userId)
    let taskListId = await taskListMysqlRepository.save(newTaskList)

    assert.ok(taskListId, 'tasklist created')

    newTaskList.taskListId = taskListId
    let taskList = await taskListMysqlRepository.getById(taskListId)

    assert.deepEqual(taskList, newTaskList, 'tasklist fetched')

    let taskListChange = new TaskListChange(taskListId, 'new title')
    let taskListIsUpdated = await taskListMysqlRepository.update(taskListChange)

    assert.true(taskListIsUpdated, 'tasklist updated')

    newTaskList.title = 'new title'
    let updatedTaskList = await taskListMysqlRepository.getById(taskListId)

    assert.deepEqual(updatedTaskList, newTaskList, 'tasklist matches')

    let newTask = new Task(null, 'name', taskListId, projectId, userId)
    let taskId = await taskMysqlRepository.save(newTask)

    assert.ok(taskId, 'task created')

    newTask.taskId = taskId
    let task = await taskMysqlRepository.getById(taskId)

    assert.deepEqual(task, newTask, 'task fetched')

    let taskChange = new TaskChange(taskId, 'new title')
    let taskIsUpdated = await taskMysqlRepository.update(taskChange)

    assert.true(taskIsUpdated, 'task updated')

    newTask.title = 'new title'
    let updatedTask = await taskMysqlRepository.getById(taskId)

    assert.deepEqual(updatedTask, newTask, 'task matches')

    await after()
  } catch (e) {
    await after()
  }

  assert.end()
})
