const router = require('express').Router()

const { User, Blog } = require('../models');
const { sequelize } = require('../util/db');

router.get('/', async (req, res) => {
    try {
        const authorsData = await User.findAll({
            attributes: [
                'id',
                'username',
                [sequelize.fn('COUNT', sequelize.col('blogs.id')), 'blogCount'],
                [sequelize.fn('SUM', sequelize.col('blogs.likes')), 'totalLikes']
            ],
            include: [{
                model: Blog,
                as: 'blogs',
                attributes: []
            }],
            group: ['user.id']
        });

        res.json(authorsData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', async (req, res) => {
    try {
        const user = await User.create(req.body)
        res.json(user)
    } catch (error) {
        return res.status(400).json({ error })
    }
})

router.put('/:username', async (req, res) => {
    const user = await User.findOne({ username: req.params.username })
    if (user) {
        user.username = req.body.username
        await user.save()
        res.json(user)
    } else {
        res.status(404).end()
    }
})

module.exports = router