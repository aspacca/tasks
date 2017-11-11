"use strict";

import User from "../../entities/user";

export default class UserMysqlRepository {
    constructor(mysqlPool) {
        this.mysqlPool = mysqlPool;
    }

    async getById(userId) {
        let error, results = await this.mysqlPool.query('SELECT * FROM user WHERE id_user = ?', [userId]);
        if (error) {
            throw error;
        }

        if (0 === results.length) {
            throw new Error();
        }

        let user = new User(results[0].id_user, results[0].email, results[0].encrypted_password, results[0].first_name, results[0].last_name);
        return user;
    }

    async getByEmail(email) {
        let error, results = await this.mysqlPool.query('SELECT * FROM user WHERE email = ?', [email]);
        if (error) {
            throw error;
        }

        if (0 === results.length) {
            throw new Error();
        }

        let user = new User(results[0].id_user, results[0].email, results[0].encrypted_password, results[0].first_name, results[0].last_name);
        return user;
    }

    async save(user) {
        let error, results = await this.mysqlPool.query('INSERT INTO user (email, encrypted_password, first_name, last_name) VALUES (?, ?, ?, ?)', [user.email, user.encryptedPassword, user.firstName, user.lastName]);
        if (error) {
            throw error;
        }

        return results.insertId;
    }

    async update(userChange) {
        let userId = userChange.userId;
        delete userChange.userId;

        if (!userChange.email) {
            delete userChange.email;
        }

        if (!userChange.first_name) {
            delete userChange.first_name;
        }

        if (!userChange.last_name) {
            delete userChange.last_name;
        }

        let error, results = await this.mysqlPool.query('UPDATE user SET ? WHERE id_user = ?', [userChange, userId]);
        if (error) {
            return false;
        }

        return results.affectedRows === 1;
    }
}
