'use strict'

export default class User {
  constructor (userId, email, encryptedPassword, firstName, lastName) {
    this.userId = userId
    this.email = email
    this.encryptedPassword = encryptedPassword
    this.firstName = firstName
    this.lastName = lastName
  }

  toJSON () {
    return {
      userId: this.userId,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName
    }
  }
}
