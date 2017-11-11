"use strict";

import Task from "../../entities/task";

export default class TaskRedisRepository {
    constructor(redisClient) {
        this.redisClient = redisClient;
    }

    async getById(taskId) {
        try {
            let key = "task_" + taskId;
            let err, reply = await this.redisClient.hgetallAsync(key);
            if (!err && null !== reply) {
                let task = new Task(reply.taskId, reply.title, reply.taskListId, reply.projectId, reply.userId);
                return task;
            }
        } catch(e) { }
    }

    save(task) {
        try {
            let key = "task_" + task.taskId;
            this.redisClient.hmset(key, task);
        } catch(e) { }
    }

    delete(taskId) {
        try {
            let key = "task_" + taskId;
            this.redisClient.del(key);
        } catch(e) {}
    }
}