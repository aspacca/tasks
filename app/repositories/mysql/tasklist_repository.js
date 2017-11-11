"use strict";

import TaskList from "../../entities/tasklist";

export default class TaskListMysqlRepository {
    constructor(mysqlPool) {
        this.mysqlPool = mysqlPool;
    }

    async getById(taskListId) {
        let error, results = await this.mysqlPool.query('SELECT * FROM tasklist WHERE id_tasklist = ?', [taskListId]);
        if (error) {
            throw error;
        }

        if (0 === results.length) {
            throw new Error();
        }

        let taskListRow = results[0];
        error, results = await this.mysqlPool.query('SELECT COALESCE(GROUP_CONCAT(id_task), "") AS tasks FROM task WHERE fk_tasklist = ?', [taskListId]);
        if (error) {
            throw error;
        }

        let taskList = new TaskList(taskListRow.id_tasklist, taskListRow.title, taskListRow.fk_project, results[0].tasks, taskListRow.fk_user);
        return taskList;
    }

    async save(taskList) {
        let error, results = await this.mysqlPool.query('INSERT INTO tasklist (title, fk_project, fk_user) VALUES (?, ?, ?)', [taskList.title, taskList.projectId, taskList.userId]);
        if (error) {
            throw error;
        }

        return results.insertId;
    }

    async update(taskListChange) {
        let taskListId = taskListChange.taskListId;
        delete taskListChange.taskListId;

        let error, results = await this.mysqlPool.query('UPDATE tasklist SET ? WHERE id_tasklist = ?', [taskListChange, taskListId]);
        if (error) {
            return false;
        }

        return results.affectedRows === 1;
    }
}
