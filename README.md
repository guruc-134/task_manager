# TASK MANAGER API

#### This Api supports many functions, features for building a fully functional user task management application with the following features.
#### Testing done using jest
# Features:
* sends welcome mail after logging in
* sends goodbye mail after user profile deletion
* automatic image resizing and cropping
* passwords hashing
* jwt tokens to store, regester sessions of user login

Task Manager API :
{{url}} = https://task-manager-134.herokuapp.com

### endpoints for user
- Create User
GET : {{url}}/users 
body : - {name, email, password}

- User Login
POST : {{url}}/users/login
body : - {name, email}

- User logout (current session)
POST: {{url}}/users/logout

- User logout (all sessions/devices)
POST: {{url}}/user/logoutAll

- read user profile
GET: {{url}}/users/me

- update user profile
PATCH: {{url}}/users/me
body : - required fields

- delete user
DELETE: {{url}}/users/me

- upload user avatar
POST: {{url}}/users/me/avatar
key:value => avatar:picture

- delete user avatar
DELETE: {{url}}/users/me/avatar


### end points for tasks

- create task
POST: {{url}}/tasks
body:
{
completed,
description
}

- read tasks
query parameters  completed={value}, limit={value}, skip ={value} , sortBy = createdAt:inc or createdAt:dsc
GET: {{url}}/tasks?query

- get task by id
GET: {{url}}/tasks/:id

- delete task by id
DELETE: {{url}}/tasks/:id

- update task by id
PATCH: {{url}}/tasks/:id

