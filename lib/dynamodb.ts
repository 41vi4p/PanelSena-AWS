import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, DeleteCommand, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

// Create document client for easier operations
export const dynamoDb = DynamoDBDocumentClient.from(client)

// Table names
export const TABLES = {
  DISPLAY_STATUS: process.env.DYNAMODB_DISPLAY_STATUS_TABLE || 'PanelSena-DisplayStatus',
  PLAYBACK_COMMANDS: process.env.DYNAMODB_COMMANDS_TABLE || 'PanelSena-PlaybackCommands',
  DEVICE_REGISTRY: process.env.DYNAMODB_DEVICE_REGISTRY_TABLE || 'PanelSena-DeviceRegistry',
  DEVICE_LINKS: process.env.DYNAMODB_DEVICE_LINKS_TABLE || 'PanelSena-DeviceLinks',
}

// Helper functions for common operations
export const dynamoHelpers = {
  // Put item
  async put(tableName: string, item: Record<string, any>) {
    const command = new PutCommand({
      TableName: tableName,
      Item: item,
    })
    return await dynamoDb.send(command)
  },

  // Get item
  async get(tableName: string, key: Record<string, any>) {
    const command = new GetCommand({
      TableName: tableName,
      Key: key,
    })
    const result = await dynamoDb.send(command)
    return result.Item
  },

  // Update item
  async update(tableName: string, key: Record<string, any>, updateExpression: string, expressionAttributeValues: Record<string, any>, expressionAttributeNames?: Record<string, string>) {
    const command = new UpdateCommand({
      TableName: tableName,
      Key: key,
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: 'ALL_NEW',
    })
    const result = await dynamoDb.send(command)
    return result.Attributes
  },

  // Delete item
  async delete(tableName: string, key: Record<string, any>) {
    const command = new DeleteCommand({
      TableName: tableName,
      Key: key,
    })
    return await dynamoDb.send(command)
  },

  // Scan table
  async scan(tableName: string, filterExpression?: string, expressionAttributeValues?: Record<string, any>) {
    const command = new ScanCommand({
      TableName: tableName,
      FilterExpression: filterExpression,
      ExpressionAttributeValues: expressionAttributeValues,
    })
    const result = await dynamoDb.send(command)
    return result.Items || []
  },

  // Query table
  async query(tableName: string, keyConditionExpression: string, expressionAttributeValues: Record<string, any>, filterExpression?: string) {
    const command = new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      FilterExpression: filterExpression,
    })
    const result = await dynamoDb.send(command)
    return result.Items || []
  },
}