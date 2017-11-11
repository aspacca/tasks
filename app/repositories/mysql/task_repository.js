"use strict";

import Task from "../../entities/task";

export default class TaskMysqlRepository {
    constructor(mysqlPool) {
        this.mysqlPool = mysqlPool;
    }

    async getById(taskId) {
        let error, results = await this.mysqlPool.query('SELECT task.*, tasklist.fk_project FROM task JOIN tasklist ON id_tasklist = fk_tasklist WHERE id_task = ?', [taskId]);
        if (error) {
            throw error;
        }

        if (0 === results.length) {
            throw new Error();
        }

        let task = new Task(results[0].id_task, results[0].title, results[0].fk_tasklist, results[0].fk_project, results[0].fk_user);
        return task;
    }

    async save(task) {
        let error, results = await this.mysqlPool.query('INSERT INTO task (title, fk_tasklist, fk_user) VALUES (?, ?, ?)', [task.title, task.taskListId, task.userId]);
        if (error) {
            throw error;
        }

        return results.insertId;
    }

    async update(taskChange) {
        let taskId = taskChange.taskId;
        delete taskChange.taskId;

        if (!taskChange.title) {
            delete taskChange.title;
        }

        if (!taskChange.fk_tasklist) {
            delete taskChange.fk_tasklist;
        }

        let error, results = await this.mysqlPool.query('UPDATE task SET ? WHERE id_task = ?', [taskChange, taskId]);
        if (error) {
            return false;
        }

        return results.affectedRows === 1;
    }
}
