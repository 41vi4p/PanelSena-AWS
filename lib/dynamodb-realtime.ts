import { dynamoHelpers, TABLES } from './dynamodb'
import { LivePlaybackStatus, PlaybackCommand, DeviceRegistration } from './types'

// DynamoDB key helpers
const createDisplayStatusKey = (userId: string, displayId: string) => ({
  pk: `DISPLAY_STATUS#${userId}`,
  sk: `DISPLAY#${displayId}`,
})

const createCommandKey = (userId: string, displayId: string, commandId: string) => ({
  pk: `COMMANDS#${userId}#${displayId}`,
  sk: `COMMAND#${commandId}`,
})

const createDeviceRegistryKey = (deviceId: string) => ({
  pk: 'DEVICE_REGISTRY',
  sk: `DEVICE#${deviceId}`,
})

const createDeviceLinkKey = (deviceId: string) => ({
  pk: 'DEVICE_LINKS',
  sk: `LINK#${deviceId}`,
})

// Update display live status
export async function updateDisplayStatus(
  userId: string,
  displayId: string,
  status: Partial<LivePlaybackStatus>
): Promise<void> {
  const key = createDisplayStatusKey(userId, displayId)
  const updateExpression = 'SET #status = :status, lastHeartbeat = :lastHeartbeat'
  const expressionAttributeNames = { '#status': 'status' }
  const expressionAttributeValues = {
    ':status': status,
    ':lastHeartbeat': Date.now(),
  }

  // First try to get existing item
  const existing = await dynamoHelpers.get(TABLES.DISPLAY_STATUS, key)

  if (existing) {
    // Update existing
    await dynamoHelpers.update(
      TABLES.DISPLAY_STATUS,
      key,
      updateExpression,
      expressionAttributeValues,
      expressionAttributeNames
    )
  } else {
    // Create new
    const newItem = {
      ...key,
      ...status,
      lastHeartbeat: Date.now(),
      createdAt: Date.now(),
    }
    await dynamoHelpers.put(TABLES.DISPLAY_STATUS, newItem)
  }
}

// Get display live status
export async function getDisplayStatus(
  userId: string,
  displayId: string
): Promise<LivePlaybackStatus | null> {
  const key = createDisplayStatusKey(userId, displayId)
  const item = await dynamoHelpers.get(TABLES.DISPLAY_STATUS, key)

  if (!item) return null

  // Remove DynamoDB keys from response
  const { pk, sk, createdAt, ...status } = item
  return status as LivePlaybackStatus
}

// Send command to display
export async function sendPlaybackCommand(
  userId: string,
  displayId: string,
  command: Omit<PlaybackCommand, 'commandId' | 'timestamp' | 'status'>
): Promise<string> {
  const commandId = `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const key = createCommandKey(userId, displayId, commandId)

  const fullCommand: PlaybackCommand = {
    ...command,
    commandId,
    timestamp: Date.now(),
    status: 'pending',
  }

  const item = {
    ...key,
    ...fullCommand,
    ttl: Math.floor((Date.now() + 24 * 60 * 60 * 1000) / 1000), // TTL for 24 hours
  }

  await dynamoHelpers.put(TABLES.PLAYBACK_COMMANDS, item)

  // Log activity
  try {
    await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        type: 'display',
        action: 'Playback Command Sent',
        description: `Sent ${command.type} command to display`,
        metadata: { displayId, commandType: command.type }
      })
    })
  } catch (error) {
    console.error('Failed to log playback command activity:', error)
  }

  return commandId
}

// Get pending commands for a display
export async function getPendingCommands(
  userId: string,
  displayId: string
): Promise<Record<string, PlaybackCommand>> {
  const keyConditionExpression = 'pk = :pk'
  const expressionAttributeValues = {
    ':pk': `COMMANDS#${userId}#${displayId}`,
  }

  const items = await dynamoHelpers.query(
    TABLES.PLAYBACK_COMMANDS,
    keyConditionExpression,
    expressionAttributeValues
  )

  const commands: Record<string, PlaybackCommand> = {}
  items.forEach(item => {
    const { pk, sk, ttl, ...command } = item
    commands[command.commandId] = command as PlaybackCommand
  })

  return commands
}

// Update command status
export async function updateCommandStatus(
  userId: string,
  displayId: string,
  commandId: string,
  status: 'executed' | 'failed',
  result?: string
): Promise<void> {
  const key = createCommandKey(userId, displayId, commandId)
  const updateExpression = 'SET #status = :status, #result = :result'
  const expressionAttributeNames = { '#status': 'status', '#result': 'result' }
  const expressionAttributeValues = {
    ':status': status,
    ':result': result || '',
  }

  await dynamoHelpers.update(
    TABLES.PLAYBACK_COMMANDS,
    key,
    updateExpression,
    expressionAttributeValues,
    expressionAttributeNames
  )
}

// Delete command
export async function deleteCommand(
  userId: string,
  displayId: string,
  commandId: string
): Promise<void> {
  const key = createCommandKey(userId, displayId, commandId)
  await dynamoHelpers.delete(TABLES.PLAYBACK_COMMANDS, key)
}

// Register device
export async function registerDevice(
  userId: string,
  displayId: string,
  deviceInfo: Omit<DeviceRegistration, 'lastSeen'>
): Promise<void> {
  // For backward compatibility, we'll store device info in display status for now
  // In a full migration, this might be moved to a separate table
  const key = createDisplayStatusKey(userId, displayId)
  const updateExpression = 'SET deviceInfo = :deviceInfo, lastSeen = :lastSeen'
  const expressionAttributeValues = {
    ':deviceInfo': deviceInfo,
    ':lastSeen': Date.now(),
  }

  const existing = await dynamoHelpers.get(TABLES.DISPLAY_STATUS, key)
  if (existing) {
    await dynamoHelpers.update(
      TABLES.DISPLAY_STATUS,
      key,
      updateExpression,
      expressionAttributeValues
    )
  } else {
    const newItem = {
      ...key,
      deviceInfo,
      lastSeen: Date.now(),
      createdAt: Date.now(),
    }
    await dynamoHelpers.put(TABLES.DISPLAY_STATUS, newItem)
  }
}

// Update device heartbeat
export async function updateDeviceHeartbeat(
  userId: string,
  displayId: string
): Promise<void> {
  const key = createDisplayStatusKey(userId, displayId)
  const updateExpression = 'SET lastSeen = :lastSeen'
  const expressionAttributeValues = {
    ':lastSeen': Date.now(),
  }

  await dynamoHelpers.update(
    TABLES.DISPLAY_STATUS,
    key,
    updateExpression,
    expressionAttributeValues
  )
}

// Initialize display status
export async function initializeDisplayStatus(
  userId: string,
  displayId: string,
  displayName: string
): Promise<void> {
  const key = createDisplayStatusKey(userId, displayId)
  const initialStatus: LivePlaybackStatus = {
    displayId,
    displayName,
    status: 'online',
    currentContent: null,
    schedule: null,
    lastHeartbeat: Date.now(),
    volume: 80,
  }

  const item = {
    ...key,
    ...initialStatus,
    createdAt: Date.now(),
  }

  await dynamoHelpers.put(TABLES.DISPLAY_STATUS, item)
}

// Clean up old commands
export async function cleanupOldCommands(
  userId: string,
  displayId: string
): Promise<void> {
  const commands = await getPendingCommands(userId, displayId)
  const oneHourAgo = Date.now() - 60 * 60 * 1000

  for (const [commandId, command] of Object.entries(commands)) {
    if (command.timestamp < oneHourAgo && command.status !== 'pending') {
      await deleteCommand(userId, displayId, commandId)
    }
  }
}

// Device-based authentication functions

// Register a new device with device_id and device_key
export async function registerDeviceWithKey(
  deviceId: string,
  deviceKey: string,
  deviceInfo: {
    displayName: string
    ipAddress?: string
    macAddress?: string
    osVersion?: string
  }
): Promise<void> {
  const key = createDeviceRegistryKey(deviceId)
  const item = {
    ...key,
    deviceId,
    deviceKey,
    displayName: deviceInfo.displayName,
    registeredAt: Date.now(),
    lastSeen: Date.now(),
    ipAddress: deviceInfo.ipAddress || '',
    macAddress: deviceInfo.macAddress || '',
    osVersion: deviceInfo.osVersion || '',
    linkedToUser: null,
    status: 'registered',
  }

  await dynamoHelpers.put(TABLES.DEVICE_REGISTRY, item)
}

// Verify device credentials
export async function verifyDeviceCredentials(
  deviceId: string,
  deviceKey: string
): Promise<boolean> {
  const key = createDeviceRegistryKey(deviceId)
  const item = await dynamoHelpers.get(TABLES.DEVICE_REGISTRY, key)

  if (!item) return false

  return item.deviceKey === deviceKey
}

// Link device to user
export async function linkDeviceToUser(
  deviceId: string,
  deviceKey: string,
  userId: string,
  displayId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify device credentials first
    const isValid = await verifyDeviceCredentials(deviceId, deviceKey)
    if (!isValid) {
      return { success: false, error: 'Invalid device credentials' }
    }

    // Check if device is already linked
    const deviceKeyDb = createDeviceRegistryKey(deviceId)
    const deviceData = await dynamoHelpers.get(TABLES.DEVICE_REGISTRY, deviceKeyDb)

    if (deviceData?.linkedToUser && deviceData.linkedToUser !== userId) {
      return { success: false, error: 'Device already linked to another user' }
    }

    // Create device link
    const linkKey = createDeviceLinkKey(deviceId)
    const linkItem = {
      ...linkKey,
      deviceId,
      userId,
      displayId,
      linkedAt: Date.now(),
      status: 'active',
    }
    await dynamoHelpers.put(TABLES.DEVICE_LINKS, linkItem)

    // Update device registry
    const updateExpression = 'SET linkedToUser = :userId, linkedDisplayId = :displayId, #status = :status, lastLinked = :lastLinked'
    const expressionAttributeNames = { '#status': 'status' }
    const expressionAttributeValues = {
      ':userId': userId,
      ':displayId': displayId,
      ':status': 'linked',
      ':lastLinked': Date.now(),
    }

    await dynamoHelpers.update(
      TABLES.DEVICE_REGISTRY,
      deviceKeyDb,
      updateExpression,
      expressionAttributeValues,
      expressionAttributeNames
    )

    return { success: true }
  } catch (error) {
    console.error('Error linking device:', error)
    return { success: false, error: 'Failed to link device' }
  }
}

// Get user ID and display ID for a device
export async function getDeviceLink(
  deviceId: string
): Promise<{ userId: string; displayId: string } | null> {
  const key = createDeviceLinkKey(deviceId)
  const item = await dynamoHelpers.get(TABLES.DEVICE_LINKS, key)

  if (!item) return null

  return {
    userId: item.userId,
    displayId: item.displayId,
  }
}

// Unlink device from user
export async function unlinkDevice(deviceId: string): Promise<void> {
  const linkKey = createDeviceLinkKey(deviceId)
  await dynamoHelpers.delete(TABLES.DEVICE_LINKS, linkKey)

  const deviceKey = createDeviceRegistryKey(deviceId)
  const updateExpression = 'SET linkedToUser = :nullValue, linkedDisplayId = :nullValue, #status = :status, lastUnlinked = :lastUnlinked'
  const expressionAttributeNames = { '#status': 'status' }
  const expressionAttributeValues = {
    ':nullValue': null,
    ':status': 'registered',
    ':lastUnlinked': Date.now(),
  }

  await dynamoHelpers.update(
    TABLES.DEVICE_REGISTRY,
    deviceKey,
    updateExpression,
    expressionAttributeValues,
    expressionAttributeNames
  )
}

// Update device last seen timestamp
export async function updateDeviceLastSeen(deviceId: string): Promise<void> {
  const key = createDeviceRegistryKey(deviceId)
  const updateExpression = 'SET lastSeen = :lastSeen'
  const expressionAttributeValues = {
    ':lastSeen': Date.now(),
  }

  await dynamoHelpers.update(
    TABLES.DEVICE_REGISTRY,
    key,
    updateExpression,
    expressionAttributeValues
  )
}

// Get all display statuses for a user
export async function getAllDisplayStatuses(
  userId: string
): Promise<Record<string, LivePlaybackStatus>> {
  const keyConditionExpression = 'pk = :pk'
  const expressionAttributeValues = {
    ':pk': `DISPLAY_STATUS#${userId}`,
  }

  const items = await dynamoHelpers.query(
    TABLES.DISPLAY_STATUS,
    keyConditionExpression,
    expressionAttributeValues
  )

  const statuses: Record<string, LivePlaybackStatus> = {}
  items.forEach(item => {
    const { pk, sk, createdAt, deviceInfo, ...status } = item
    const displayId = sk.replace('DISPLAY#', '')
    statuses[displayId] = status as LivePlaybackStatus
  })

  return statuses
}