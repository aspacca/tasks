'use strict'

import Project from '../entities/project'

export default class ProjectService {
  constructor (
        projectMysqlRepository,
        projectRedisRepository
    ) {
    this.projectMysqlRepository = projectMysqlRepository
    this.projectRedisRepository = projectRedisRepository
  }

  async getProject (projectId) {
    let project = await this.projectRedisRepository.getById(projectId)
    if (!project) {
      project = await this.projectMysqlRepository.getById(projectId)
      if (project && project.projectId) {
        this.projectRedisRepository.save(project)
      }
    }

    return project
  }

  async applyChanges (projectChange) {
    this.projectRedisRepository.delete(projectChange.projectId)
    let res = await this.projectMysqlRepository.update(projectChange)

    return res
  }

  async createNew (req) {
    let project = new Project(null, req.name, null, req.authUserId)
    let projectId = await this.projectMysqlRepository.save(project)
    if (!projectId) {
      return
    }

    project.projectId = projectId
    project = JSON.parse(JSON.stringify(project))

    this.projectRedisRepository.save(project)

    return projectId
  }
}
