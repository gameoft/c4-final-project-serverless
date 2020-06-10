import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
//import { SignedURLRequest } from '../models/SignedUrlRequest'

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

export class TodoItemAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly indexName = process.env.INDEX_NAME,
    private readonly todosTable = process.env.TODOS_TABLE
  ) {}

  // async getAllGroups(): Promise<Group[]> {
  //     console.log('Getting all groups')

  //     const result = await this.docClient.scan({
  //       TableName: this.groupsTable
  //     }).promise()

  //     const items = result.Items
  //     return items as Group[]
  //   }

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    console.log('Getting all todos')

    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: this.indexName,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    const items = result.Items

    return items as TodoItem[]
  }

  async createTodo(todoItem: TodoItem) {
    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todoItem
      })
      .promise()
  }

  async deleteTodo(userId: string, todoId: string) {
    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId
        }
      })
      .promise()
  }

  async getTodo(userId: string, todoId: string) {
    const result = await this.docClient
      .get({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId
        }
      })
      .promise()

    return result.Item as TodoItem
  }

  async updateTodo(
    userId: string,
    todoId: string,
    updatedTodoItem: TodoUpdate
  ) {
    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId
        },
        UpdateExpression: 'set #name = :n, #dueDate = :due, #done = :d',
        ExpressionAttributeValues: {
          ':n': updatedTodoItem.name,
          ':due': updatedTodoItem.dueDate,
          ':d': updatedTodoItem.done
        },
        ExpressionAttributeNames: {
          '#name': 'name',
          '#dueDate': 'dueDate',
          '#done': 'done'
        }
      })
      .promise()
  }
}

/**
 * Fields in a request to get a Signed URL request
 */
// export interface SignedURLRequest {
//     Bucket: string,
//     Key: string,
//     Expires: number
//   }

export function getPresignedUploadURL(userId: string, todoId: string) {
  console.log('userId: ', userId)

  const url = s3.getSignedUrl('putObject', {
    Bucket: process.env.IMAGES_S3_BUCKET,
    Key: todoId,
    Expires: process.env.SIGNED_URL_EXPIRATION
  })

  const newUrl = url.split('?')[0]
  console.log('newUrl: ', newUrl)

  return url
}

function createDynamoDBClient() {
  return new XAWS.DynamoDB.DocumentClient()
}
