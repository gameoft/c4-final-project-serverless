import * as uuid from 'uuid'

import { APIGatewayProxyEvent } from 'aws-lambda'

import { TodoItem } from '../models/TodoItem'
import { TodoItemAccess, getPresignedUploadURL } from '../dataLayer/todosAccess'

import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

import { createLogger } from '../utils/logger'
import { getUserId } from '../lambda/utils'

const todoItemAccess = new TodoItemAccess()
const logger = createLogger('businessLogic')
const bucketName = process.env.IMAGES_S3_BUCKET

export async function getAllTodos(
  event: APIGatewayProxyEvent
): Promise<TodoItem[]> {
  const userId = getUserId(event)
  logger.info('Call getAllTodos userId= ', userId)

  return await todoItemAccess.getAllTodos(userId)
}

export async function createTodo(
  event: APIGatewayProxyEvent,
  createTodoRequest: CreateTodoRequest
): Promise<TodoItem> {
  const createdAt = new Date(Date.now()).toISOString()
  const userId = getUserId(event)
  const todoId = uuid.v4()

  const newTodo = {
    userId,
    todoId,
    createdAt,
    done: false,
    attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`,
    ...createTodoRequest
  }

  logger.info('Call createTodo', newTodo)
  await todoItemAccess.createTodo(newTodo)

  return newTodo
}

export async function deleteTodo(event: APIGatewayProxyEvent) {
  const todoId = event.pathParameters.todoId

  console.log('Delete todo: ', todoId)

  const userId = getUserId(event)
  console.log('userId= ', userId)

  if (!(await todoItemAccess.getTodo(userId, todoId))) {
    return false
  }
  await todoItemAccess.deleteTodo(userId, todoId)

  return
}

export async function updateTodo(
  event: APIGatewayProxyEvent,
  updateTodoRequest: UpdateTodoRequest
) {
  const todoId = event.pathParameters.todoId
  console.log('Update todo: ', todoId)
  const userId = getUserId(event)
  console.log('userId= ', userId)
  if (!(await todoItemAccess.getTodo(userId, todoId))) {
    return false
  }
  await todoItemAccess.updateTodo(userId, todoId, updateTodoRequest)
  logger.info('Updated todo')

  return
}

export async function generateUploadUrl(event: APIGatewayProxyEvent) {
  const todoId = event.pathParameters.todoId
  logger.info('Call getUserId', event)
  const userId = getUserId(event)
  logger.info('Call getPresignedUploadURL')
  return getPresignedUploadURL(userId, todoId)
}
