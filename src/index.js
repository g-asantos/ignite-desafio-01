const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  
  const {username} = request.headers;

  const user = users.find(user => user.username === username );

  if(!user){
    return response.status(400).json({error: "User not found"});
  }

  request.user = user;

  return next();

}

app.post('/users', (request, response) => {
  const {name, username} = request.body;

  const userFound = users.find(user => user.username === username );

  if(userFound){
    return response.status(400).json({error: "User already exists"});
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  
  const {user} = request;

  return response.json(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {

  const {user} = request;
  const {title, deadline} = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  
  const {id} = request.params;
  const {user} = request;
  const {title, deadline} = request.body;

  const todosIndex = user.todos.findIndex(todo => todo.id === id);

  if(todosIndex === -1){
    return response.status(404).json({error: "Todo not found"});
  }

  const todo = {
    id: user.todos[todosIndex].id,
    title,
    done: user.todos[todosIndex].done,
    deadline: new Date(deadline),
    created_at: user.todos[todosIndex].created_at
  };

  user.todos[todosIndex] = todo;

  return response.status(201).json(todo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  
  const {id} = request.params;
  const {user} = request;
 
  const todosIndex = user.todos.findIndex(todo => todo.id === id);

  if(todosIndex === -1){
    return response.status(404).json({error: "Todo not found"});
  }

  const todo = {
    id: user.todos[todosIndex].id,
    title: user.todos[todosIndex].title,
    done: !user.todos[todosIndex].done,
    deadline: user.todos[todosIndex].deadline,
    created_at: user.todos[todosIndex].created_at
  };

  user.todos[todosIndex] = todo;

  return response.status(201).json(todo);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {

  const {id} = request.params;
  const {user} = request;
 
  const todosIndex = user.todos.findIndex(todo => todo.id === id);

  if(todosIndex === -1){
    return response.status(404).json({error: "Todo not found"});
  }


  user.todos.splice(user.todos[todosIndex], 1);

  return response.status(204).json(user.todos);
});

module.exports = app;