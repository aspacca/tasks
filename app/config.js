'use strict'

import ProjectService from './services/project_service'
import TaskService from './services/task_service'
import TaskListService from './services/tasklist_service'
import UserService from './services/user_service'
import SearchService from './services/search_service'

import ProjectMysqlRepository from './repositories/mysql/project_repository'
import TaskListMysqlRepository from './repositories/mysql/tasklist_repository'
import TaskMysqlRepository from './repositories/mysql/task_repository'
import UserMysqlRepository from './repositories/mysql/user_repository'

import ProjectRedisRepository from './repositories/redis/project_repository'
import TaskListRedisRepository from './repositories/redis/tasklist_repository'
import TaskRedisRepository from './repositories/redis/task_repository'
import SearchRedisRepository from './repositories/redis/search_repository'

const bluebird = require('bluebird')
const mysql = require('promise-mysql')
const redis = require('redis')
const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')
const debug = require('debug')('tasks')

bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

let mysqlPool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'root',
  database: process.env.DB_NAME || 'tasks'
})

let redisClient = redis.createClient(
    process.env.REDIS_PORT || 6379,
    process.env.REDIS_HOST || '127.0.0.1',
    { enable_offline_queue: false }
)

redisClient.on('error', function (err) { debug('redis err: %s', err) })

let projectRedisRepository = new ProjectRedisRepository(redisClient)
let taskListRedisRepository = new TaskListRedisRepository(redisClient)
let taskRedisRepository = new TaskRedisRepository(redisClient)
let searchRedisRepository = new SearchRedisRepository(redisClient)

let projectMysqlRepository = new ProjectMysqlRepository(mysqlPool)
let taskListMysqlRepository = new TaskListMysqlRepository(mysqlPool)
let taskMysqlRepository = new TaskMysqlRepository(mysqlPool)
let userMysqlRepository = new UserMysqlRepository(mysqlPool)

export let projectService = new ProjectService(projectMysqlRepository, projectRedisRepository)
export let taskListService = new TaskListService(taskListMysqlRepository, taskListRedisRepository)
export let taskService = new TaskService(taskMysqlRepository, taskRedisRepository)
export let userService = new UserService(userMysqlRepository, jsonwebtoken, bcrypt)
export let searchService = new SearchService(searchRedisRepository)
