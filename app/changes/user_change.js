'use strict'

export default class UserChange {
  constructor (userId, email, firstName, lastName) {
    this.userId = userId
    this.email = email
    this.first_name = firstName
    this.last_name = lastName
  }
}
