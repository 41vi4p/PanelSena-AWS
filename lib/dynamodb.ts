import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, DeleteCommand, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'

// Lazy initialization to avoid errors when imported in client-side code
let dynamoDbInstance: DynamoDBDocumentClient | null = null

function getDynamoDbClient(): DynamoDBDocumentClient {
  // Return existing instance if already initialized
  if (dynamoDbInstance) {
    return dynamoDbInstance
  }

  // Only initialize on server side
  if (typeof window !== 'undefined') {
    throw new Error('DynamoDB client can only be initialized on the server side')
  }

  // Validate AWS credentials
  const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
  const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
  const AWS_REGION = process.env.AWS_REGION || 'us-east-1'

  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    console.error('❌ AWS Credentials Missing!')
    console.error('AWS_ACCESS_KEY_ID:', AWS_ACCESS_KEY_ID ? '✓ Set' : '✗ Missing')
    console.error('AWS_SECRET_ACCESS_KEY:', AWS_SECRET_ACCESS_KEY ? '✓ Set' : '✗ Missing')
    console.error('AWS_REGION:', AWS_REGION)
    throw new Error('AWS credentials are not configured. Please check your .env file and restart the server.')
  }

  console.log('✓ AWS DynamoDB Client Initialized')
  console.log('  Region:', AWS_REGION)
  console.log('  Access Key ID:', AWS_ACCESS_KEY_ID.substring(0, 8) + '...')

  // Initialize DynamoDB client
  const client = new DynamoDBClient({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  })

  // Create document client for easier operations
  dynamoDbInstance = DynamoDBDocumentClient.from(client)
  return dynamoDbInstance
}

// Export getter for dynamic client
export const dynamoDb = new Proxy({} as DynamoDBDocumentClient, {
  get(target, prop) {
    const client = getDynamoDbClient()
    return (client as any)[prop]
  }
})

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