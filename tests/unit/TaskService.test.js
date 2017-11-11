'use strict'

import TaskService from '../../app/services/task_service'
import TaskMysqlRepository from '../../app/repositories/mysql/task_repository'
import TaskRedisRepository from '../../app/repositories/redis/task_repository'

const sinon = require('sinon'),
  test = require('tape-async')

test('Unit Task Service.getById misses redis hit', async function (assert) {
  let taskMysqlRepository = new TaskMysqlRepository()
  let taskRedisRepository = new TaskRedisRepository()

  let redisSaveStub = sinon.stub(taskRedisRepository, 'save')
  let redisGetByIdStub = sinon.stub(taskRedisRepository, 'getById')
  let mysqlGetByIdStub = sinon.stub(taskMysqlRepository, 'getById')

  redisGetByIdStub.onCall(0).returns(null)
  mysqlGetByIdStub.onCall(0).returns({taskId: 1})

  let taskService = new TaskService(taskMysqlRepository, taskRedisRepository)
  let task = await taskService.getTask(1)
  assert.deepEqual(task, {taskId: 1}, 'returned value')
  assert.true(redisGetByIdStub.calledOnce, 'hit redis only once')
  assert.true(mysqlGetByIdStub.calledOnce, 'hit mysql only once')
  assert.true(redisSaveStub.calledOnce, 'cache redis only once')
})

test("Unit Task Service.getById doesn't hit mysql", async function (assert) {
  let taskMysqlRepository = new TaskMysqlRepository()
  let taskRedisRepository = new TaskRedisRepository()

  let redisSaveStub = sinon.stub(taskRedisRepository, 'save')
  let redisGetByIdStub = sinon.stub(taskRedisRepository, 'getById')
  let mysqlGetByIdStub = sinon.stub(taskMysqlRepository, 'getById')

  redisGetByIdStub.returns({taskId: 1})

  let taskService = new TaskService(taskMysqlRepository, taskRedisRepository)

  let task = await taskService.getTask(1)
  assert.deepEqual(task, {taskId: 1}, 'returned value')
  assert.true(redisGetByIdStub.calledOnce, 'hit redis only once')
  assert.equal(0, mysqlGetByIdStub.getCalls().length, "don't hit mysql")
  assert.equal(0, redisSaveStub.getCalls().length, "don't cache again")
})

test('Unit Task Service.applyChanges', async function (assert) {
  let taskMysqlRepository = new TaskMysqlRepository()
  let taskRedisRepository = new TaskRedisRepository()

  let redisDeletedStub = sinon.stub(taskRedisRepository, 'delete')
  let mysqlUpdateStub = sinon.stub(taskMysqlRepository, 'update')

  mysqlUpdateStub.returns(true)

  let taskService = new TaskService(taskMysqlRepository, taskRedisRepository)
  let applied = await taskService.applyChanges({taskId: 1})
  assert.true(applied, 'returned value')
  assert.true(mysqlUpdateStub.calledOnce, 'update in mysql')
  assert.equal(1, redisDeletedStub.getCall(0).args[0], 'purge redis cache')
})

test('Unit Task Service.createNew', async function (assert) {
  let taskMysqlRepository = new TaskMysqlRepository()
  let taskRedisRepository = new TaskRedisRepository()

  let redisSaveStub = sinon.stub(taskRedisRepository, 'save')
  let mysqlSaveStub = sinon.stub(taskMysqlRepository, 'save')

  let taskService = new TaskService(taskMysqlRepository, taskRedisRepository)

  mysqlSaveStub.onCall(0).returns(1)

  let taskId = await taskService.createNew({title: 'title'})
  assert.equal(1, taskId, 'returned value')
  assert.true(mysqlSaveStub.calledOnce, 'save in mysql')
  assert.deepEqual({taskId: 1, title: 'title', projectId: null}, redisSaveStub.getCall(0).args[0], 'chace in redis')
})
