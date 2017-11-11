'use strict'

import SearchService from '../../app/services/search_service'
import SearchRedisRepository from '../../app/repositories/redis/search_repository'

const sinon = require('sinon'),
  test = require('tape')

test('Unit Search Service.search', async function (assert) {
  let searchRedisRepository = new SearchRedisRepository()

  let redisSearchStub = sinon.stub(searchRedisRepository, 'search')

  let expected = [
    'http://url/projects/1',
    'http://url/tasklists/2',
    'http://url/tasks/3'
  ]

  let mockedResults = [
        { type: 'projects', id: 1 },
        { type: 'tasklists', id: 2 },
        { type: 'tasks', id: 3 }
  ]

  searchRedisRepository.search.onCall(0).returns(mockedResults)
  let searchService = new SearchService(searchRedisRepository)

  let results = await searchService.search('query', 'http://url')
  assert.deepEqual(expected, results, 'urls in search results')
})
