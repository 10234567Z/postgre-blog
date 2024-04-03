const router = require('express').Router()

const { Blog } = require('../models')

const blogFinder = async (req, res, next) => {
    const blog = await Blog.findByPk(req.params.id)
    if (blog) {
        req.blog = blog
        next()
    } else {
        res.status(404).json({ error: 'blog not found' })
    }
}

router.get('/', async (req, res) => {
    const blogs = await Blog.findAll()
    res.json(blogs)
})
router.post('/', async (req, res) => {
    try {
        const blog = await Blog.create(req.body)
        res.json(blog)
    } catch (error) {
        return res.status(400).json({ error })
    }
})
router.delete('/:id', blogFinder, async (req, res) => {
    await req.blog.destroy()
    res.status(204).end()
})

module.exports = router