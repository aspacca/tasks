'use strict'

export default class SearchService {
  constructor (searchRedisRepository) {
    this.searchRedisRepository = searchRedisRepository
  }

  async search (value, url) {
    let results = await this.searchRedisRepository.search(value)
    if (results.length === 0) {
      return results
    }

    let locations = []
    results.forEach(function (result) {
      let location = url + '/' + result.type + '/' + result.id
      locations.push(location)
    })

    return locations
  }

  push (value, type, id) {
    this.searchRedisRepository.push(value, type, id)
  }

  flush () {
    this.searchRedisRepository.flush()
  }
}
