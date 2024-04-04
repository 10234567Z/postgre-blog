const router = require('express').Router()
require('express-async-errors');
const { SECRET } = require('../util/config')
const jwt = require('jsonwebtoken')
const { Blog, User } = require('../models');
const { Op } = require('sequelize');

const blogFinder = async (req, res, next) => {
    const blog = await Blog.findByPk(req.params.id)
    if (blog) {
        req.blog = blog
        next()
    } else {
        res.status(404).json({ error: 'blog not found' })
    }
}

const tokenExtractor = (req, res, next) => {
    const authorization = req.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
      try {
        console.log(authorization.substring(7))
        console.log(SECRET)
        req.decodedToken = jwt.verify(authorization.substring(7), SECRET)
      } catch (error) {
        console.log(error)
        return res.status(401).json({ error: 'token invalid' })
      }
    } else {
      return res.status(401).json({ error: 'token missing' })
    }
  
    next()
  }

router.get('/', async (req, res) => {
    const blogs = await Blog.findAll({
        include: {
            model: User,
            attributes: { exclude: ['userId'] }
        },
        where: {
            [Op.or]: [
                {title: {[Op.substring]: req.query.search ? req.query.search : ''}},
                { '$user.username$' : {[Op.substring]: req.query.search ? req.query.search : ''}},
                { '$user.name$' : {[Op.substring]: req.query.search ? req.query.search : ''}}
            ]
        },
        order: [['likes', 'DESC']]
    })
    res.json(blogs)
})
router.post('/', tokenExtractor , async (req, res) => {
    const user = await User.findByPk(req.decodedToken.id)
    const blog = await Blog.create({...req.body ,userId: user.id})
    res.json(blog)
})
router.put('/:id', blogFinder, async (req, res) => {
    req.blog.likes += 1;
    await req.blog.save()
    res.json({ likes: req.blog.likes })
})
router.delete('/:id', tokenExtractor, blogFinder ,async (req, res) => {
    if(req.decodedToken.id === req.blog.userId){
        await req.blog.destroy()
        res.status(204).end()
    }
    else
    {
        res.status(401).json({ error: 'unauthorized' })
    }
})

module.exports = router