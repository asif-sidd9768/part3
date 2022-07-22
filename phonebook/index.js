require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const app = express()

app.use(express.json())
app.use(express.static('build'))
app.use(cors())
morgan.token('user-data', function (req, res) {
  console.log(req.body)
  return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :http-version :response-time :user-data'))

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>')
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
})

app.get('/api/persons/:id', (req, res, next) => {

  console.log(typeof req.params.id)
  Person.findById(req.params.id).then(person => {
    if (person) {
      res.json(person)
    } else {
      res.status(404).end()
    }
  })
    .catch(error => next(error))

})

app.get('/info', (req, res) => {
  Person.find({}).then(persons => {
    res.send(
      `
                <p>Phonebook has info for ${persons.length} people</p>
                ${new Date()}
            `
    )
  })

})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  if (body.name === undefined) {
    return res.status(400).json({
      error: 'Content missing'
    })
  }

  const person = new Person({
    'name': body.name,
    'number': body.number
  })

  person.save()
    .then(savedPerson => {
      res.json(savedPerson)
    })
    .catch(error => next(error))

})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'Content missing'
    })
  }

  const person = {
    number: body.number
  }

  const opts = {
    new: true,
    runValidators: true
  }
  Person.findByIdAndUpdate(req.params.id, person, opts)
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(error => {
      console.log('Error Called DING DONG DING')
      next(error)
    })
})

app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  Person.findByIdAndRemove(id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({
    eror: 'unknown endpoint'
  })
}

app.use(unknownEndpoint)
const errorHandler = (error, req, res, next) => {
  console.log(error.message)

  if (error.name === 'CastError'){
    return res.status(400).send({
      error: 'malformatted id'
    })
  } else if (error.name === 'ValidationError') {
    return res.status(400).send({
      error: error.message
    })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server started on ${PORT}`)
})