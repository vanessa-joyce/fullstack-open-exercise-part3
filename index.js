require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()
morgan.token('request-body', (request) => {
    return JSON.stringify(request.body)
})

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(requestLogger)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :request-body'))

const getAllPersons = () => {
  return Person.find({}).then(persons => {
    console.log(persons, 'persons')
    return persons
  })
}

const phonebookInfo = () => {
    const date = new Date()
    return getAllPersons()
    .then(persons => {
      return `
      <p>Phonebook has info for ${persons.length} people<br /></p>
      <p>${date.toString()}</p>
  `
    })
}

const sendErrorResponse = (response, status, message) => {
    response.statusMessage = message
    return response.status(status).end()
}

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    return response.json(person)
  })
  .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const { name, number } = request.body
    if (!number) return sendErrorResponse(response, 422, 'Number attribute must exist')
    // if (nameExists(body.name)) return sendErrorResponse(response, 422, 'Name must be unique')
    Person.find({name: name}), (err, data) => {
      console.log(data, 'person found')
      if (data) return response.json(400).send({ error: 'person already exists'})
    }


    const person = new Person({
      name: name,
      number: number
    })

    person.save().then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  const person = {
    number: body.number,
    name: body.name
  }

  Person.findByIdAndUpdate(request.params.id, person, {new: true})
  .then(updatedPerson => {
    response.json(updatedPerson)
  })
  .catch(error => next(error))
})


app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
  .then(persons => {
    response.json(persons)
  })
  .catch(error => next(error))
})

app.get('/info', (request, response) => {
  response.type('html')
  phonebookInfo().then(content => {
    response.send(content)
  })

})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id'})
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message})
  }

  next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})