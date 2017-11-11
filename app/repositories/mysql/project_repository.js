"use strict";

import Project from "../../entities/project";

export default class ProjectMysqlRepository {
    constructor(mysqlPool) {
        this.mysqlPool = mysqlPool;
    }

    async getById(projectId) {
        let error, results = await this.mysqlPool.query('SELECT * FROM project WHERE id_project = ?', [projectId]);
        if (error) {
            throw error;
        }

        if (0 === results.length) {
            throw new Error();
        }

        let projectRow = results[0];
        error, results = await this.mysqlPool.query('SELECT COALESCE(GROUP_CONCAT(id_tasklist), "") AS tasklists FROM tasklist WHERE fk_project = ?', [projectId]);
        if (error) {
            throw error;
        }

        let project = new Project(projectRow.id_project, projectRow.name, results[0].tasklists, projectRow.fk_user);
        return project;
    }

    async save(project) {
        let error, results = await this.mysqlPool.query('INSERT INTO project (name, fk_user) VALUES (?, ?)', [project.name, project.userId]);
        if (error) {
            throw error;
        }

        return results.insertId;
    }

    async update(projectChange) {
        let projectId = projectChange.projectId;
        delete projectChange.projectId;

        let error, results = await this.mysqlPool.query('UPDATE project SET ? WHERE id_project = ?', [projectChange, projectId]);
        if (error) {
            return false;
        }

        return results.affectedRows === 1;
    }
}
