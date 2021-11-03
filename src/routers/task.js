const express = require('express');
const Task = require('../models/tasks');
const auth = require('../middleware/auth');
const router = new express.Router();

router.post('/tasks', auth, async (req, res) => {
    //const task = new Task(req.body);
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send(e);
    }
})

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=10
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
    const populateOptions = { path: 'tasks', options: { sort: { createdAt: 1 } } };

    if (req.query.completed) {
        populateOptions.match = {};
        populateOptions.match.completed = (req.query.completed === 'true');
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        populateOptions.options.sort[parts[0]] = (parts[1] === 'desc' ? -1 : 1);
    }

    if (req.query.limit) { populateOptions.options.limit = parseInt(req.query.limit, 10) }

    if (req.query.skip) { populateOptions.options.skip = parseInt(req.query.skip, 10) }

    try {
        await req.user.populate([populateOptions]);
        res.send(req.user.tasks);
    } catch (e) {
        res.status(500).send(e);
    }

});

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findOne({ _id, owner: req.user._id });
        if (!task) {
            return res.status(404).send();
        }
        res.send(task);
    } catch (e) {
        res.status(500).send(e);
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
    if (!isValidOperation) {
        return res.status(404).send('Invalid updates');
    }
    const _id = req.params.id;
    try {
        const task = await Task.findOne({ _id, owner: req.user._id });

        if (!task) {
            return res.status(404).send();
        }

        updates.forEach((update) => task[update] = req.body[update]);
        await task.save();

        res.send(task);
    } catch (e) {
        res.status(400).send(e);
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findOneAndDelete({ _id, owner: req.user.id });
        if (!task) {
            return res.status(404).send();
        }
        res.send(task);
    } catch (e) {
        res.status(500).send(e);
    }
})

module.exports = router;