const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const passport = require('passport')

const Post = require('../modules/Post')
const Profile = require('../modules/Profile')

const validatePostInput = require('../validation/post')

router.get('/test', (req, res) => res.json({ msg: 'Post Works' }))

router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {

    const { errors, isvalid } = validatePostInput(req.body)

    if (isvalid) {
        return res.status(400).json(errors)
    }
    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    })
    newPost.save().then(post => res.json(post)).catch(err => res.status(400).json(err))
})

router.get('/', (req, res) => {
    const errors = {}
    Post.find()
        .sort({ date: -1 })
        .then(posts => res.json(posts))
        .catch(err => {
            errors.nopostsfound = 'No posts were found!'
            res.status(404).json(errors)
        })
})

router.get('/:id', (req, res) => {
    const errors = {}
    Post.findById(req.params.id)
        .then(post => res.json(post))
        .catch(err => {
            errors.nopostfound = 'No post were found!'
            res.status(404).json(errors)
        })
})

router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const errors = {}
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    if (post.user.toString() !== req.user.id) {
                        errors.notauthorized = 'User is not authorized!'
                        res.status(401).json(errors)
                    }

                    post.remove().then(() => res.json({ success: true })).catch(err => res.status(404).json(err))
                })
                .catch(err => {
                    errors.postnotfound = 'No post found!'
                    res.status(404).json(errors)
                })
        })
})

router.post('/like/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const errors = {}
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
                        errors.alreadyliked = 'User already liked this post!'
                        return res.status(400).json(errors)
                    }

                    post.likes.unshift({ user: req.user.id })
                    post.save().then(post => res.json(post)).catch(err => res.status(404).json(err))
                })
                .catch(err => {
                    errors.postnotfound = 'No post found!'
                    res.status(404).json(errors)
                })
        })
})

router.post('/unlike/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const errors = {}
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
                        errors.notliked = 'You have note liked this post!'
                        return res.status(400).json(errors)
                    }

                    const removeIndex = post.likes.map(item => item.user.toString()).indexOf(req.user.id)
                    post.likes.splice(removeIndex, 1)
                    post.save().then(post => res.json(post))
                })
                .catch(err => {
                    errors.postnotfound = 'No post found!'
                    res.status(404).json(errors)
                })
        })
})

router.post('/comment/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isvalid } = validatePostInput(req.body)

    if (isvalid) {
        return res.status(400).json(errors)
    }
    Post.findById(req.params.id)
        .then(post => {
            const newComment = {
                text: req.body.text,
                name: req.body.name,
                avatar: req.body.avatar,
                user: req.user.id
            }

            post.comments.unshift(newComment)

            post.save().then(post => res.json(post))
        })
        .catch(err => {
            res.status(404).json({ postnotfound: 'Post not found!' })
        })
})

router.post('/comment/:id/:comment_id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Post.findById(req.params.id)
        .then(post => {
            if (post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
                return res.status(404).json({ commentnotexists: 'Comment does not exist!' })
            }

            const removeIndex = post.comments.map(item => item._id.toString()).indexOf(req.params.comment_id)
            post.comments.splice(removeIndex, 1)
            post.save().then(post => res.json(post))
        })
        .catch(err => {
            res.status(404).json({ postnotfound: 'Post not found!' })
        })
})


module.exports = router;