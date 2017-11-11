'use strict'

import User from '../entities/user'

export default class UserService {
  constructor (
        userMysqlRepository,
        jsonwebtoken,
        bcrypt
    ) {
    this.userMysqlRepository = userMysqlRepository
    this.jsonwebtoken = jsonwebtoken
    this.bcrypt = bcrypt
  }

  async verifyJwtToken (token) {
    let decoded = await this.jsonwebtoken.verify(token, 'JWTSECRET')
    let user = await this.userMysqlRepository.getByEmail(decoded.email)

    return user
  }

  async authenticate (email, password) {
    let user = await this.userMysqlRepository.getByEmail(email)
    if (this.bcrypt.compareSync(password, user.encryptedPassword)) {
      let jwtData = JSON.parse(JSON.stringify(user))
      let token = this.jsonwebtoken.sign(jwtData, 'JWTSECRET', { expiresIn: '1h' })

      return token
    }

    return false
  }

  async getUser (userId) {
    let user = await this.userMysqlRepository.getById(userId)

    return user
  }

  async applyChanges (userChange) {
    let res = await this.userMysqlRepository.update(userChange)

    return res
  }

  async createNew (req) {
    let user = new User(null, req.email, null, req.first_name, req.last_name)
    user.encryptedPassword = this.bcrypt.hashSync(req.password, 10)

    let userId = await this.userMysqlRepository.save(user)

    return userId
  }
}
