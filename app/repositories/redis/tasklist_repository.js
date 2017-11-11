"use strict";

import TaskList from "../../entities/tasklist";

export default class TaskListRedisRepository {
    constructor(redisClient) {
        this.redisClient = redisClient;
    }

    async getById(taskListId) {
        try {
            let key = "tasklist_" + taskListId;
            let err, reply = await this.redisClient.getAsync(key);
            if (!err && null !== reply) {
                reply = JSON.parse(reply);
                let taskList = new TaskList(reply.taskListId, reply.title, reply.projectId, reply.tasks.join(","), reply.userId);
                return taskList;
            }
        } catch(e) { }
    }

    save(tasklist) {
        try {
            let key = "tasklist_" + tasklist.taskListId;
            this.redisClient.set(key, JSON.stringify(tasklist));
        } catch(e) { }
    }

    delete(taskListId) {
        try {
            let key = "tasklist_" + taskListId;
            this.redisClient.del(key);
        } catch(e) {}
    }
}
