const express = require('express')
const app = express()

app.use(express.json())

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
    let newPerson = {...request.body, id: `${id}`}
    persons = persons.concat(newPerson)
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



const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})