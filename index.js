require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

const app = express();

morgan.token("data-sent", (req) => {
  return JSON.stringify(req.body);
});

app.use(express.static("dist")); // show static content (minified version of the app)
app.use(cors()); // allow requests from all origins
app.use(express.json());
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :data-sent"
  )
);

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const currentDate = new Date().toString();
const amount = persons.length;

app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then((persons) => {
      response.json(persons);
    })
    .catch((error) => next(error));
});

app.get("/info", (request, response) => {
  response.send(
    `<p>Phonebook has info for ${amount} people</p><p>${currentDate}</p>`
  );
});

// app.get("/api/persons/:id", (request, response) => {
//   const id = Number(request.params.id);
//   const person = persons.find((person) => person.id === id);

//   if (person) {
//     response.json(person);
//   } else {
//     response.status(404).end();
//   }
// });

app.delete("/api/persons/:id", (request, response, next) => {
  // const id = Number(request.params.id);
  // persons = persons.filter((person) => person.id !== id);
  // response.status(204).end();
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

function getRandomId(max) {
  return Math.floor(Math.random() * max);
}

// app.post("/api/persons", (request, response) => {
//   const body = request.body;
//   const personExist = person.find((person) => person.name === body.name);

//   if (!body.name || !body.number) {
//     return response.status(400).json({
//       error: "content is missing",
//     });
//   } else if (personExist) {
//     return response.status(409).json({
//       error: "name must be unique",
//     });
//   }

//   const person = {
//     id: getRandomId(100),
//     name: body.name,
//     number: body.number,
//   };
//   persons = persons.concat(person);

//   response.json(person);
// });

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;
  const personExist = person.find((person) => person.name === body.name);

  const person = {
    name: body.name,
    number: body.number,
  };

  if (personExist) {
    Person.findByIdAndUpdate(request.params.id, person, { new: true })
      .then((updatedPerson) => {
        response.json(updatedPerson);
      })
      .catch((error) => next(error));
  }
});

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (body === undefined) {
    return response.status(400).json({ error: "content missing" });
  }

  const person = new Person({
    name: body.name,
    number: body.number || false,
  });

  person.save().then((savedPerson) => {
    response.json(savedPerson);
  });
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on PORT${PORT}`);
});
