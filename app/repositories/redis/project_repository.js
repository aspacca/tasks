"use strict";

import Project from "../../entities/project";

export default class ProjectRedisRepository {
    constructor(redisClient) {
        this.redisClient = redisClient;
    }

    async getById(projectId) {
        try {
            let key = "project_" + projectId;
            let err, reply = await this.redisClient.getAsync(key);

            if (!err && null !== reply) {
                reply = JSON.parse(reply);
                let project = new Project(reply.projectId, reply.name, reply.taskLists.join(","), reply.userId);
                return project;
            }
        } catch(e) { }
    }

    save(project) {
        try {
            let key = "project_" + project.projectId;
            this.redisClient.set(key, JSON.stringify(project));
        } catch(e) { }
    }

    delete(projectId) {
        try {
            let key = "project_" + projectId;
            this.redisClient.del(key);
        } catch(e) {}
    }
}
