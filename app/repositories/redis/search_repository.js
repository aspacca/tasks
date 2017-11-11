"use strict";

export default class SearchRedisRepository {
    constructor(redisClient) {
        this.redisClient = redisClient;
    }

    async search(value) {
        try {
            let key = "search";
            let err, reply = await this.redisClient.smembersAsync(key);
            let results = [];
            let search = new RegExp(".*" + value + ".*", 'i');
            if (!err && null !== reply) {
                reply.forEach(function(entry) {
                    entry = JSON.parse(entry);
                    entry.id = parseInt(entry.id)
                    if (entry.value.match(search)) {
                        results.push(entry);
                    }
                });
            }

            return results;
        } catch(e) { }
    }

    push(value, type, id) {
        try {
            let key = "search";
            let entry = { "type": type, "value": value, "id": parseInt(id) };
            entry = JSON.stringify(entry);
            this.redisClient.sadd(key, entry);
        } catch(e) {}
    }

    flush() {
        try {
            let key = "search";
            this.redisClient.del(key);
        } catch(e) {}
    }
}
