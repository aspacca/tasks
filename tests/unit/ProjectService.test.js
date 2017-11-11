'use strict'

import ProjectService from '../../app/services/project_service'
import ProjectMysqlRepository from '../../app/repositories/mysql/project_repository'
import ProjectRedisRepository from '../../app/repositories/redis/project_repository'

const sinon = require('sinon'),
  test = require('tape-async')

test('Unit Project Service.getById misses redis hit', async function (assert) {
  let projectMysqlRepository = new ProjectMysqlRepository()
  let projectRedisRepository = new ProjectRedisRepository()

  let redisSaveStub = sinon.stub(projectRedisRepository, 'save')
  let redisGetByIdStub = sinon.stub(projectRedisRepository, 'getById')
  let mysqlGetByIdStub = sinon.stub(projectMysqlRepository, 'getById')

  redisGetByIdStub.onCall(0).returns(null)
  mysqlGetByIdStub.onCall(0).returns({projectId: 1})

  let projectService = new ProjectService(projectMysqlRepository, projectRedisRepository)
  let project = await projectService.getProject(1)
  assert.deepEqual(project, {projectId: 1}, 'returned value')
  assert.true(redisGetByIdStub.calledOnce, 'hit redis only once')
  assert.true(mysqlGetByIdStub.calledOnce, 'hit mysql only once')
  assert.true(redisSaveStub.calledOnce, 'cache redis only once')
})

test("Unit Project Service.getById doesn't hit mysql", async function (assert) {
  let projectMysqlRepository = new ProjectMysqlRepository()
  let projectRedisRepository = new ProjectRedisRepository()

  let redisSaveStub = sinon.stub(projectRedisRepository, 'save')
  let redisGetByIdStub = sinon.stub(projectRedisRepository, 'getById')
  let mysqlGetByIdStub = sinon.stub(projectMysqlRepository, 'getById')

  redisGetByIdStub.returns({projectId: 1})

  let projectService = new ProjectService(projectMysqlRepository, projectRedisRepository)

  let project = await projectService.getProject(1)
  assert.deepEqual(project, {projectId: 1}, 'returned value')
  assert.true(redisGetByIdStub.calledOnce, 'hit redis only once')
  assert.equal(0, mysqlGetByIdStub.getCalls().length, "don't hit mysql")
  assert.equal(0, redisSaveStub.getCalls().length, "don't cache again")
})

test('Unit Project Service.applyChanges', async function (assert) {
  let projectMysqlRepository = new ProjectMysqlRepository()
  let projectRedisRepository = new ProjectRedisRepository()

  let redisDeletedStub = sinon.stub(projectRedisRepository, 'delete')
  let mysqlUpdateStub = sinon.stub(projectMysqlRepository, 'update')

  mysqlUpdateStub.returns(true)

  let projectService = new ProjectService(projectMysqlRepository, projectRedisRepository)
  let applied = await projectService.applyChanges({projectId: 1})
  assert.true(applied, 'returned value')
  assert.true(mysqlUpdateStub.calledOnce, 'update in mysql')
  assert.equal(1, redisDeletedStub.getCall(0).args[0], 'purge redis cache')
})

test('Unit Project Service.createNew', async function (assert) {
  let projectMysqlRepository = new ProjectMysqlRepository()
  let projectRedisRepository = new ProjectRedisRepository()

  let redisSaveStub = sinon.stub(projectRedisRepository, 'save')
  let mysqlSaveStub = sinon.stub(projectMysqlRepository, 'save')

  let projectService = new ProjectService(projectMysqlRepository, projectRedisRepository)

  mysqlSaveStub.onCall(0).returns(1)

  let projectId = await projectService.createNew({name: 'name'})
  assert.equal(1, projectId, 'returned value')
  assert.true(mysqlSaveStub.calledOnce, 'save in mysql')
  assert.deepEqual({projectId: 1, name: 'name', taskLists: []}, redisSaveStub.getCall(0).args[0], 'chace in redis')
})
