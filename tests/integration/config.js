'use strict'

const bluebird = require('bluebird'),
  mysql = require('promise-mysql'),
  redis = require('redis'),
  fs = require('fs')

bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

import ProjectMysqlRepository from '../../app/repositories/mysql/project_repository'
import TaskListMysqlRepository from '../../app/repositories/mysql/tasklist_repository'
import TaskMysqlRepository from '../../app/repositories/mysql/task_repository'
import UserMysqlRepository from '../../app/repositories/mysql/user_repository'
import ProjectRedisRepository from '../../app/repositories/redis/project_repository'
import TaskListRedisRepository from '../../app/repositories/redis/tasklist_repository'
import TaskRedisRepository from '../../app/repositories/redis/task_repository'
import SearchRedisRepository from '../../app/repositories/redis/search_repository'

export let mysqlPool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'root',
  database: process.env.DB_NAME || 'tasks_test'
})

export let redisClient = redis.createClient(
    process.env.REDIS_PORT || 6379,
    process.env.REDIS_HOST || '127.0.0.1',
    { enable_offline_queue: true }
)

redisClient.on('error', function (err) {})

export let projectRedisRepository = new ProjectRedisRepository(redisClient)
export let taskListRedisRepository = new TaskListRedisRepository(redisClient)
export let taskRedisRepository = new TaskRedisRepository(redisClient)
export let searchRedisRepository = new SearchRedisRepository(redisClient)

export let projectMysqlRepository = new ProjectMysqlRepository(mysqlPool)
export let taskListMysqlRepository = new TaskListMysqlRepository(mysqlPool)
export let taskMysqlRepository = new TaskMysqlRepository(mysqlPool)
export let userMysqlRepository = new UserMysqlRepository(mysqlPool)
