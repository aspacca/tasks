'use strict'

import User from '../../app/entities/user'
import UserService from '../../app/services/user_service'
import UserMysqlRepository from '../../app/repositories/mysql/user_repository'

const sinon = require('sinon'),
  test = require('tape')

test('Unit User Service.verifyJwtToken', async function (assert) {
  let userMysqlRepository = new UserMysqlRepository()
  let jsonwebtoken = require('jsonwebtoken')

  let mysqlGetByEmailStub = sinon.stub(userMysqlRepository, 'getByEmail')
  let jsonwebtokenVerifyStub = sinon.stub(jsonwebtoken, 'verify')

  jsonwebtokenVerifyStub.returns({ email: 'email'})
  mysqlGetByEmailStub.returns({ userId: 1, email: 'email' })

  let userService = new UserService(userMysqlRepository, jsonwebtoken, null)
  let user = await userService.verifyJwtToken('token')
  assert.deepEqual(user, { userId: 1, email: 'email'}, 'return user')
})

test('Unit User Service.authenticate succeeds', async function (assert) {
  let userMysqlRepository = new UserMysqlRepository()
  let jsonwebtoken = require('jsonwebtoken')
  let bcrypt = require('bcrypt')

  let mysqlGetByEmailStub = sinon.stub(userMysqlRepository, 'getByEmail')
  let jsonwebtokenSignStub = sinon.stub(jsonwebtoken, 'sign')
  let bcryptCompareSyncStub = sinon.stub(bcrypt, 'compareSync')

  let user = new User(1, 'email', 'password')

  mysqlGetByEmailStub.returns(user)
  bcryptCompareSyncStub.withArgs('password', 'password').returns(true)
  jsonwebtokenSignStub.withArgs(JSON.parse(JSON.stringify(user)), 'JWTSECRET', { expiresIn: '1h' }).returns('token')

  let userService = new UserService(userMysqlRepository, jsonwebtoken, bcrypt)
  let token = await userService.authenticate('email', 'password')
  assert.equal('token', token, 'returns token')

  jsonwebtokenSignStub.restore()
  bcryptCompareSyncStub.restore()
})

test('Unit User Service.authenticate fails', async function (assert) {
  let userMysqlRepository = new UserMysqlRepository()
  let jsonwebtoken = require('jsonwebtoken')
  let bcrypt = require('bcrypt')

  let mysqlGetByEmailStub = sinon.stub(userMysqlRepository, 'getByEmail')
  let jsonwebtokenSignStub = sinon.stub(jsonwebtoken, 'sign')
  let bcryptCompareSyncStub = sinon.stub(bcrypt, 'compareSync')

  let user = new User(1, 'email', 'password')

  mysqlGetByEmailStub.returns(user)
  bcryptCompareSyncStub.withArgs('password', 'password').returns(false)

  let userService = new UserService(userMysqlRepository, jsonwebtoken, bcrypt)
  let token = await userService.authenticate('email', 'password')
  assert.equal(false, token, 'authentication fails')
  assert.equal(0, jsonwebtokenSignStub.getCalls().length, "token doesn't get generated")

  jsonwebtokenSignStub.restore()
  bcryptCompareSyncStub.restore()
})
