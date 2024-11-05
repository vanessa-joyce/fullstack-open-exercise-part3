const express = require('express')
const app = express()

app.use(express.json())

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

app.use(requestLogger)

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

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
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)
    if (person) response.json(person)
    response.status(404).end()
  })
  
app.post('/api/persons', (request, response) => {
    const id = Math.floor(Math.random() * 100000)
    const body = request.body
    if (!body.name) return sendErrorResponse(response, 422, 'Name attribute must exist')
    if (!body.number) return sendErrorResponse(response, 422, 'Number attribute must exist')
    if (nameExists(body.name)) return sendErrorResponse(response, 422, 'Name must be unique')

    const person = {...body, id: `${id}`}
    persons = persons.concat(person)
    return response.json(person)
})


app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)
    response.json(persons)
})

app.get('/info', (request, response) => {
  response.type('html')
  response.send(phonebookInfo())
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint'})
}

app.use(unknownEndpoint)



const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})