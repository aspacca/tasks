'use strict'

import {
    projectService,
    taskListService,
    taskService,
    userService,
    searchService
} from './config'

import TaskChange from './changes/task_change'
import TaskListChange from './changes/tasklist_change'
import ProjectChange from './changes/project_change'
import UserChange from './changes/user_change'

const debug = require('debug')('tasks')
const errors = require('restify-error')
const restify = require('restify')
const restifyValidation = require('node-restify-validation')

const server = restify.createServer({name: 'tasks'})

server.on('uncaughtException', function (req, res, route, err) {
  res.send(new errors.NotAuthorizedError())
})

server.use(restify.plugins.queryParser())
server.use(restify.plugins.bodyParser())
server.use(restifyValidation.validationPlugin({
  errorsAsArray: false,
  forbidUndefinedVariables: true
}))

let jwtAuth = function (req, res, next) {
  let authHeader = req.header('Authorization')
  if (!authHeader) {
    res.send(new errors.NotAuthorizedError())
    next(false)

    return
  }

  let token = authHeader.replace(/^Bearer /, '')

  userService.verifyJwtToken(token)
        .then(function (user) {
          req.params.authUserId = user.userId
          return next()
        }).catch(function () {
          res.send(new errors.NotAuthorizedError())
          next(false)
        })
}

server.post({url: '/users/signup',
  validation: {
    content: {
      email: { isRequired: true, isEmail: true },
      password: { isRequired: true, regex: /^.{1,255}$/ },
      first_name: { isRequired: true, regex: /^.{1,255}$/ },
      last_name: { isRequired: true, regex: /^.{1,255}$/ }
    }
  }}, function (req, res, next) {
  userService.createNew(req.params)
        .then(function (userId) {
          if (userId) {
            res.json(201, 'Created')
          } else {
            res.send(new errors.BadRequestError())
          }

          next()
        }).catch(function () {
          res.send(new errors.BadRequestError())
          next()
        })
})

server.post({url: '/users/login',
  validation: {
    content: {
      email: { isRequired: true, isEmail: true },
      password: { isRequired: true }
    }
  }}, function (req, res, next) {
  userService.authenticate(req.params.email, req.params.password)
        .then(function (token) {
          if (token === false) {
            res.send(new errors.BadRequestError())
            next()

            return
          }

          res.json(200, { 'token': token })
          next()
        }).catch(function () {
          res.send(new errors.BadRequestError())
          next()
        })
})

server.patch({url: '/users/:userId',
  validation: {
    resources: {
      userId: { isRequired: true, isNumeric: true }
    },
    content: {
      email: { isRequired: false, isEmail: true },
      first_name: { isRequired: false, regex: /^.{1,255}$/ },
      last_name: { isRequired: false, regex: /^.{1,255}$/ }
    }
  }}, jwtAuth, function (req, res, next) {
    if (req.params.authUserId !== req.params.userId) {
      res.send(new errors.NotAuthorizedError())
      next()

      return
    }

    userService.getUser(req.params.userId)
        .then(function (user) {
          if (user) {
            let userChange = new UserChange(
                    req.params.userId,
                    req.params.email ? req.params.email : null,
                    req.params.first_name ? req.params.first_name : null,
                    req.params.last_name ? req.params.last_name : null
                )

            userService.applyChanges(userChange)
                    .then(function (applied) {
                      if (applied) {
                        res.json(202, 'Accepted')
                      } else {
                        res.send(new errors.BadRequestError())
                      }
                    }).catch(function () {
                      res.send(new errors.BadRequestError())
                    })
          }
        }).catch(function () {
          res.send(new errors.BadRequestError())
          next()
        })
  })

server.post({url: '/projects',
  validation: {
    content: {
      name: { isRequired: true, regex: /^.{1,255}$/ }
    }
  }}, jwtAuth, function (req, res, next) {
    projectService.createNew(req.params)
        .then(function (projectId) {
          if (projectId) {
            searchService.push(req.params.name, 'projects', projectId)

            res.header('Location', server.url + '/projects/' + projectId)
            res.json(201, 'Created')
          } else {
            res.send(new errors.BadRequestError())
          }

          next()
        }).catch(function () {
          res.send(new errors.BadRequestError())

          next()
        })
  })

server.get({url: '/projects/:projectId',
  validation: {
    resources: {
      projectId: { isRequired: true, isNumeric: true }
    }
  }}, jwtAuth, function (req, res, next) {
    projectService.getProject(req.params.projectId)
        .then(function (project) {
          if (project) {
            searchService.push(project.name, 'projects', project.projectId)

            res.json(200, project)
          } else {
            res.send(new errors.NotFoundError())
          }

          next()
        }).catch(function () {
          res.send(new errors.NotFoundError())

          next()
        })
  })

server.post({url: '/tasklists',
  validation: {
    content: {
      title: { isRequired: true, regex: /^.{1,255}$/ },
      project_id: { isRequired: true, isNumeric: true }
    }
  }}, jwtAuth, function (req, res, next) {
    taskListService.createNew(req.params)
        .then(function (taskListId) {
          if (taskListId) {
            let projectChange = new ProjectChange(req.params.project_id)
            projectService.applyChanges(projectChange, function () {})

            searchService.push(req.params.title, 'tasklists', taskListId)

            res.header('Location', server.url + '/tasklists/' + taskListId)
            res.json(201, 'Created')
          } else {
            res.send(new errors.BadRequestError())
          }

          next()
        }).catch(function () {
          res.send(new errors.BadRequestError())

          next()
        })
  })

server.get({url: '/tasklists/:taskListId',
  validation: {
    resources: {
      taskListId: { isRequired: true, isNumeric: true }
    }
  }}, jwtAuth, function (req, res, next) {
    taskListService.getTaskList(req.params.taskListId)
        .then(function (taskList) {
          if (taskList) {
            searchService.push(taskList.title, 'tasklists', taskList.taskListId)

            res.json(200, taskList)
          } else {
            res.send(new errors.NotFoundError())
          }

          next()
        }).catch(function () {
          res.send(new errors.NotFoundError())

          next()
        })
  })

server.post({url: '/tasks',
  validation: {
    content: {
      title: { isRequired: true, regex: /^.{1,255}$/ },
      tasklist_id: { isRequired: true, isNumeric: true }
    }
  }}, jwtAuth, function (req, res, next) {
    taskService.createNew(req.params)
        .then(function (taskId) {
          if (taskId) {
            let taskListChange = new TaskListChange(req.params.tasklist_id)
            taskListService.applyChanges(taskListChange, function () {})

            searchService.push(req.params.title, 'tasks', taskId)

            res.header('Location', server.url + '/tasks/' + taskId)
            res.json(201, 'Created')
          } else {
            res.send(new errors.BadRequestError())
          }

          next()
        }).catch(function (e) {
          res.send(new errors.BadRequestError())

          next()
        })
  })

server.get({url: '/tasks/:taskId',
  validation: {
    resources: {
      taskId: { isRequired: true, isNumeric: true }
    }
  }}, jwtAuth, function (req, res, next) {
    taskService.getTask(req.params.taskId)
        .then(function (task) {
          if (task) {
            searchService.push(task.title, 'tasks', task.taskId)

            res.json(200, task)
          } else {
            res.send(new errors.NotFoundError())
          }

          next()
        }).catch(function (e) {
          res.send(new errors.NotFoundError())

          next()
        })
  })

server.patch({url: '/tasks/:taskId',
  validation: {
    resources: {
      taskId: { isRequired: true, isNumeric: true }
    },
    content: {
      title: { isRequired: false, regex: /^.{1,255}$/ },
      tasklist_id: { isRequired: false, isNumeric: true }
    }
  }}, jwtAuth, function (req, res, next) {
    taskService.getTask(req.params.taskId)
        .then(function (task) {
          if (task) {
            let taskChange = new TaskChange(
                    req.params.taskId,
                    req.params.title ? req.params.title : null,
                    req.params.tasklist_id ? req.params.tasklist_id : null
                )

            taskService.applyChanges(taskChange)
                    .then(function (applied) {
                      if (applied) {
                        if (taskChange.fk_tasklist) {
                          let taskListChange = new TaskListChange(task.taskListId)
                          taskListService.applyChanges(taskListChange).catch(function () {})

                          taskListChange = new TaskListChange(taskChange.fk_tasklist)
                          taskListService.applyChanges(taskListChange).catch(function () {})
                        }

                        searchService.flush()

                        res.json(202, 'Accepted')
                      } else {
                        res.send(new errors.BadRequestError())
                      }
                    }).catch(function () {
                      res.send(new errors.BadRequestError())
                    })
          } else {
            res.send(new errors.BadRequestError())
          }

          next()
        }).catch(function () {
          res.send(new errors.BadRequestError())

          next()
        })
  })

server.get({url: '/search',
  validation: {
    queries: {
      q: { isRequired: true, isAlphanumeric: true }
    }
  }}, jwtAuth, function (req, res, next) {
    searchService.search(req.query.q, server.url)
        .then(function (results) {
          res.json(200, results)
        }).catch(function () {
          res.send(new errors.NotFoundError())
        })

    next()
  })

server.listen(process.env.REST_PORT || 8080, process.env.REST_HOST || '127.0.0.1', function () {
  debug('%s listing at %s', server.name, server.url)
})
