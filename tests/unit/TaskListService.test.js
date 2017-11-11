'use strict'

import TaskListService from '../../app/services/taskList_service'
import TaskListMysqlRepository from '../../app/repositories/mysql/taskList_repository'
import TaskListRedisRepository from '../../app/repositories/redis/taskList_repository'

const sinon = require('sinon'),
  test = require('tape-async')

test('Unit TaskList Service.getById misses redis hit', async function (assert) {
  let taskListMysqlRepository = new TaskListMysqlRepository()
  let taskListRedisRepository = new TaskListRedisRepository()

  let redisSaveStub = sinon.stub(taskListRedisRepository, 'save')
  let redisGetByIdStub = sinon.stub(taskListRedisRepository, 'getById')
  let mysqlGetByIdStub = sinon.stub(taskListMysqlRepository, 'getById')

  redisGetByIdStub.onCall(0).returns(null)
  mysqlGetByIdStub.onCall(0).returns({taskListId: 1})

  let taskListService = new TaskListService(taskListMysqlRepository, taskListRedisRepository)
  let taskList = await taskListService.getTaskList(1)
  assert.deepEqual(taskList, {taskListId: 1}, 'returned value')
  assert.true(redisGetByIdStub.calledOnce, 'hit redis only once')
  assert.true(mysqlGetByIdStub.calledOnce, 'hit mysql only once')
  assert.true(redisSaveStub.calledOnce, 'cache redis only once')
})

test("Unit TaskList Service.getById doesn't hit mysql", async function (assert) {
  let taskListMysqlRepository = new TaskListMysqlRepository()
  let taskListRedisRepository = new TaskListRedisRepository()

  let redisSaveStub = sinon.stub(taskListRedisRepository, 'save')
  let redisGetByIdStub = sinon.stub(taskListRedisRepository, 'getById')
  let mysqlGetByIdStub = sinon.stub(taskListMysqlRepository, 'getById')

  redisGetByIdStub.returns({taskListId: 1})

  let taskListService = new TaskListService(taskListMysqlRepository, taskListRedisRepository)

  let taskList = await taskListService.getTaskList(1)
  assert.deepEqual(taskList, {taskListId: 1}, 'returned value')
  assert.true(redisGetByIdStub.calledOnce, 'hit redis only once')
  assert.equal(0, mysqlGetByIdStub.getCalls().length, "don't hit mysql")
  assert.equal(0, redisSaveStub.getCalls().length, "don't cache again")
})

test('Unit TaskList Service.applyChanges', async function (assert) {
  let taskListMysqlRepository = new TaskListMysqlRepository()
  let taskListRedisRepository = new TaskListRedisRepository()

  let redisDeletedStub = sinon.stub(taskListRedisRepository, 'delete')
  let mysqlUpdateStub = sinon.stub(taskListMysqlRepository, 'update')

  mysqlUpdateStub.returns(true)

  let taskListService = new TaskListService(taskListMysqlRepository, taskListRedisRepository)
  let applied = await taskListService.applyChanges({taskListId: 1})
  assert.true(applied, 'returned value')
  assert.true(mysqlUpdateStub.calledOnce, 'update in mysql')
  assert.equal(1, redisDeletedStub.getCall(0).args[0], 'purge redis cache')
})

test('Unit TaskList Service.createNew', async function (assert) {
  let taskListMysqlRepository = new TaskListMysqlRepository()
  let taskListRedisRepository = new TaskListRedisRepository()

  let redisSaveStub = sinon.stub(taskListRedisRepository, 'save')
  let mysqlSaveStub = sinon.stub(taskListMysqlRepository, 'save')

  let taskListService = new TaskListService(taskListMysqlRepository, taskListRedisRepository)

  mysqlSaveStub.onCall(0).returns(1)

  let taskListId = await taskListService.createNew({title: 'title'})
  assert.equal(1, taskListId, 'returned value')
  assert.true(mysqlSaveStub.calledOnce, 'save in mysql')
  assert.deepEqual({taskListId: 1, title: 'title', tasks: []}, redisSaveStub.getCall(0).args[0], 'chace in redis')
})
