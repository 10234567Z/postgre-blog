const Blog = require('./blog')
const User = require('./user')

User.hasMany(Blog)
Blog.belongsTo(User)
User.belongsTo(Blog)

Blog.sync({alter: true})
User.sync({alter: true})

module.exports = {
  Blog , User
}