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

const phonebookInfo = () => {
    const date = new Date()
    return `
        <p>Phonebook has info for ${persons.length} people<br /></p>
        <p>${date.toString()}</p>
    `
}

const nameExists = (name) => {
    return persons.some(person => person.name === name)
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

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
      return response.json(person)
    })
  })
  
app.post('/api/persons', (request, response) => {
    const body = request.body
    if (!body.name) return sendErrorResponse(response, 422, 'Name attribute must exist')
    if (!body.number) return sendErrorResponse(response, 422, 'Number attribute must exist')
    // if (nameExists(body.name)) return sendErrorResponse(response, 422, 'Name must be unique')
    
    const person = new Person({
      name: body.name,
      number: body.number
    })

    person.save().then(savedNote => {
      response.json(savedNote)
    })
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
  response.send(phonebookInfo())
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint'})
}

app.use(unknownEndpoint)


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})