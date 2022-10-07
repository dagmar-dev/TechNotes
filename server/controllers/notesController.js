const User = require('../models/User')
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler')

// @decs Get all notes
// @route GET /notes
// @access private

const getAllNotes = asyncHandler(async (req, res) => {
    const notes = await Note.find().lean()
    if (!notes?.length) {
        return res.status(400).json({ message: 'No notes found' })
    }

    res.json(notes)
})

// @decs Create new note
// @route POST /notes
// @access private

const createNewNote = asyncHandler(async (req, res) => {
    const { title, text } = req.body

    //confirm data
    if (!title || !text) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    //check for duplicate
    const duplicate = await Note.findOne({ title }).lean().exec()
    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate notes' })
    }

    //Create and store a new note
    const noteObject = { username: User.username, title, text }
    const note = await Note.create(noteObject)

    if (note) {
        //created
        res.status(201).json({ message: 'New note created' })
    } else {
        res.status(400).json({ message: 'Invalid data' })
    }
})

// @decs Update a note
// @route Patch /notes
// @access private

const updateNote = asyncHandler(async (req, res) => {
    const { _id, title, text } = req.body

    //Confirm data
    if (!title || !text) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Does the note exist
    const note = await Note.findById(_id).exec()
    console.log(_id)

    if (!note) {
        return res.status(400).json({ message: 'Note not found' })
    }

    //Allow updates to the original note

    note.title = title
    note.text = text

    const updatedNote = await note.save()

    res.json({ message: `${updatedNote.title} updated` })
})

// @decs delete a notes
// @route DELETE /note
// @access private

const deleteNote = asyncHandler(async (req, res) => {
    const { title } = req.body

    if (!title) {
        return res.status(400).json({ message: 'note ID Required' })
    }

    const note = await Note.findById(title).exec()

    if (!note) {
        return res.status(400).json({ message: 'note Not Found' })
    }

    const result = await note.deleteOne()

    const reply = `Note ${result.title} with ID ${result._id} deleted`
    res.json(reply)
})



module.exports = {
    getAllNotes,
    createNewNote,
    updateNote,
    deleteNote,
}
