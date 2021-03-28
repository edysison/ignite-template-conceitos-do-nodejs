const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user)
    return response.status(404).json({ error: "username doesn't exist" });

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userExist = users.find((user) => user.username === username);
  if (userExist)
    return response.status(400).json({ error: "username already exist" });

  const id = uuidv4();
  const newUser = { id, name, username, todos: [] };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const {
    user,
    body: { title, deadline },
  } = request;

  const newToDo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newToDo);

  response.status(201).json(newToDo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const {
    user,
    params: { id },
    body: { title, deadline },
  } = request;

  const ToDo = user.todos.find((todo) => todo.id === id);
  if (!ToDo) return response.status(404).json({ error: "Todo not found" });

  ToDo.title = title;
  ToDo.deadline = new Date(deadline);

  response.status(201).json(ToDo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const {
    user,
    params: { id },
  } = request;

  const ToDo = user.todos.find((todo) => todo.id === id);
  if (!ToDo) return response.status(404).json({ error: "Todo not found" });

  ToDo.done = true;

  response.status(200).json(ToDo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const {
    user,
    params: { id },
  } = request;

  const TodoIndex = user.todos.findIndex((todo) => todo.id === id);
  if (TodoIndex < 0)
    return response.status(404).json({ error: "Todo not found" });

  user.todos.splice(TodoIndex, 1);

  response.status(204).json();
});

module.exports = app;
