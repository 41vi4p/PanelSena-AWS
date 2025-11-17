import { prisma } from './prisma'
import type {
  Display,
  ContentItem,
  Schedule,
  Activity,
  Analytics,
  User,
  DisplayStatus,
  Orientation,
  ContentType,
  ScheduleRepeat,
  ScheduleStatus,
  ActivityType
} from '@prisma/client'

// Helper function to convert Prisma enums to our string types
const convertDisplayStatus = (status: DisplayStatus): "online" | "offline" | "playing" | "paused" => {
  switch (status) {
    case 'ONLINE': return 'online'
    case 'OFFLINE': return 'offline'
    case 'PLAYING': return 'playing'
    case 'PAUSED': return 'paused'
    default: return 'offline'
  }
}

const convertOrientation = (orientation: Orientation): "landscape" | "portrait" => {
  switch (orientation) {
    case 'LANDSCAPE': return 'landscape'
    case 'PORTRAIT': return 'portrait'
    default: return 'landscape'
  }
}

const convertContentType = (type: ContentType): "image" | "video" | "document" => {
  switch (type) {
    case 'IMAGE': return 'image'
    case 'VIDEO': return 'video'
    case 'DOCUMENT': return 'document'
    default: return 'document'
  }
}

const convertScheduleRepeat = (repeat: ScheduleRepeat): "once" | "daily" | "weekly" | "monthly" => {
  switch (repeat) {
    case 'ONCE': return 'once'
    case 'DAILY': return 'daily'
    case 'WEEKLY': return 'weekly'
    case 'MONTHLY': return 'monthly'
    default: return 'once'
  }
}

const convertScheduleStatus = (status: ScheduleStatus): "active" | "paused" | "completed" => {
  switch (status) {
    case 'ACTIVE': return 'active'
    case 'PAUSED': return 'paused'
    case 'COMPLETED': return 'completed'
    default: return 'active'
  }
}

const convertActivityType = (type: ActivityType): "display" | "content" | "schedule" | "system" => {
  switch (type) {
    case 'DISPLAY': return 'display'
    case 'CONTENT': return 'content'
    case 'SCHEDULE': return 'schedule'
    case 'SYSTEM': return 'system'
    default: return 'system'
  }
}

// Convert Prisma objects to our interface types
const convertDisplay = (display: Display): Display => ({
  id: display.id,
  userId: display.userId,
  name: display.name,
  location: display.location,
  status: convertDisplayStatus(display.status),
  resolution: display.resolution,
  uptime: display.uptime,
  brightness: display.brightness,
  orientation: convertOrientation(display.orientation),
  lastUpdate: display.lastUpdate.toISOString(),
  group: display.group,
  createdAt: display.createdAt.toISOString(),
  updatedAt: display.updatedAt.toISOString(),
  volume: display.volume || undefined,
  currentContent: display.currentContent as any || undefined,
  schedule: display.schedule as any || undefined,
})

const convertContentItem = (content: ContentItem): ContentItem => ({
  id: content.id,
  userId: content.userId,
  name: content.name,
  type: convertContentType(content.type),
  size: content.size,
  sizeBytes: content.sizeBytes,
  uploadDate: content.uploadDate.toISOString(),
  category: content.category,
  thumbnail: content.thumbnail || undefined,
  url: content.url,
  storageRef: content.storageRef,
  createdAt: content.createdAt.toISOString(),
  updatedAt: content.updatedAt.toISOString(),
})

const convertSchedule = (schedule: Schedule): Schedule => ({
  id: schedule.id,
  userId: schedule.userId,
  name: schedule.name,
  displayIds: JSON.parse(schedule.displayIds),
  contentIds: JSON.parse(schedule.contentIds),
  startDate: schedule.startDate.toISOString(),
  endDate: schedule.endDate.toISOString(),
  startTime: schedule.startTime,
  endTime: schedule.endTime,
  repeat: convertScheduleRepeat(schedule.repeat),
  status: convertScheduleStatus(schedule.status),
  createdAt: schedule.createdAt.toISOString(),
  updatedAt: schedule.updatedAt.toISOString(),
})

const convertActivity = (activity: Activity): Activity => ({
  id: activity.id,
  userId: activity.userId,
  type: convertActivityType(activity.type),
  action: activity.action,
  description: activity.description,
  metadata: activity.metadata as Record<string, any> || undefined,
  timestamp: activity.timestamp.toISOString(),
})

const convertAnalytics = (analytics: Analytics): Analytics => ({
  id: analytics.id,
  userId: analytics.userId,
  displayId: analytics.displayId || undefined,
  contentId: analytics.contentId || undefined,
  metric: analytics.metric,
  value: analytics.value,
  timestamp: analytics.timestamp.toISOString(),
  date: analytics.date.toISOString().split('T')[0],
})

// Display operations
export const createDisplay = async (userId: string, displayData: Partial<Display>) => {
  const data = {
    id: crypto.randomUUID(),
    userId,
    name: displayData.name || '',
    location: displayData.location || '',
    status: 'OFFLINE' as DisplayStatus,
    resolution: displayData.resolution || '1920x1080',
    uptime: displayData.uptime || '0h 0m',
    brightness: displayData.brightness || 50,
    orientation: 'LANDSCAPE' as Orientation,
    lastUpdate: new Date(),
    updatedAt: new Date(),
    group: displayData.group || 'default',
    volume: displayData.volume,
    currentContent: displayData.currentContent,
    schedule: displayData.schedule,
  }

  const display = await prisma.displays.create({ data })
  return convertDisplay(display)
}

export const getUserDisplays = async (userId: string) => {
  const displays = await prisma.displays.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
  // Filter out incomplete displays that haven't been properly linked
  return displays
    .filter((display: any) => display.name !== "Pending Link...")
    .map(convertDisplay)
}

export const updateDisplay = async (id: string, data: Partial<Display>) => {
  const updateData: any = {}

  if (data.name !== undefined) updateData.name = data.name
  if (data.location !== undefined) updateData.location = data.location
  if (data.status !== undefined) {
    updateData.status = data.status.toUpperCase() as DisplayStatus
  }
  if (data.resolution !== undefined) updateData.resolution = data.resolution
  if (data.uptime !== undefined) updateData.uptime = data.uptime
  if (data.brightness !== undefined) updateData.brightness = data.brightness
  if (data.orientation !== undefined) {
    updateData.orientation = data.orientation.toUpperCase() as Orientation
  }
  if (data.lastUpdate !== undefined) updateData.lastUpdate = new Date(data.lastUpdate)
  if (data.group !== undefined) updateData.group = data.group
  if (data.volume !== undefined) updateData.volume = data.volume
  if (data.currentContent !== undefined) updateData.currentContent = data.currentContent
  if (data.schedule !== undefined) updateData.schedule = data.schedule

  const display = await prisma.displays.update({
    where: { id },
    data: updateData,
  })
  return convertDisplay(display)
}

export const deleteDisplay = async (id: string) => {
  await prisma.displays.delete({ where: { id } })
}

// Content operations
export const createContent = async (userId: string, contentData: Partial<ContentItem>) => {
  const data = {
    id: crypto.randomUUID(),
    userId,
    name: contentData.name || '',
    type: (contentData.type?.toUpperCase() || 'DOCUMENT') as ContentType,
    size: contentData.size || '0 B',
    sizeBytes: contentData.sizeBytes || 0,
    uploadDate: contentData.uploadDate ? new Date(contentData.uploadDate) : new Date(),
    updatedAt: new Date(),
    category: contentData.category || 'General',
    thumbnail: contentData.thumbnail,
    url: contentData.url || '',
    storageRef: contentData.storageRef || '',
  }

  const content = await prisma.content.create({ data })
  return convertContentItem(content)
}

export const getUserContent = async (userId: string) => {
  const content = await prisma.content.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
  return content.map(convertContentItem)
}

export const updateContent = async (id: string, data: Partial<ContentItem>) => {
  const updateData: any = {}

  if (data.name !== undefined) updateData.name = data.name
  if (data.type !== undefined) updateData.type = data.type.toUpperCase() as ContentType
  if (data.size !== undefined) updateData.size = data.size
  if (data.sizeBytes !== undefined) updateData.sizeBytes = data.sizeBytes
  if (data.uploadDate !== undefined) updateData.uploadDate = new Date(data.uploadDate)
  if (data.category !== undefined) updateData.category = data.category
  if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail
  if (data.url !== undefined) updateData.url = data.url
  if (data.storageRef !== undefined) updateData.storageRef = data.storageRef

  const content = await prisma.content.update({
    where: { id },
    data: updateData,
  })
  return convertContentItem(content)
}

export const deleteContent = async (id: string) => {
  await prisma.content.delete({ where: { id } })
}

// Schedule operations
export const createSchedule = async (userId: string, scheduleData: Partial<Schedule>) => {
  const data = {
    id: crypto.randomUUID(),
    userId,
    name: scheduleData.name || '',
    displayIds: JSON.stringify(scheduleData.displayIds || []),
    contentIds: JSON.stringify(scheduleData.contentIds || []),
    startDate: scheduleData.startDate ? new Date(scheduleData.startDate) : new Date(),
    endDate: scheduleData.endDate ? new Date(scheduleData.endDate) : new Date(),
    startTime: scheduleData.startTime || '09:00',
    endTime: scheduleData.endTime || '17:00',
    repeat: (scheduleData.repeat?.toUpperCase() || 'ONCE') as ScheduleRepeat,
    status: (scheduleData.status?.toUpperCase() || 'ACTIVE') as ScheduleStatus,
    updatedAt: new Date(),
  }

  const schedule = await prisma.schedules.create({ data })
  return convertSchedule(schedule)
}

export const getUserSchedules = async (userId: string) => {
  const schedules = await prisma.schedules.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
  return schedules.map(convertSchedule)
}

export const updateSchedule = async (id: string, data: Partial<Schedule>) => {
  const updateData: any = {}

  if (data.name !== undefined) updateData.name = data.name
  if (data.displayIds !== undefined) updateData.displayIds = JSON.stringify(data.displayIds)
  if (data.contentIds !== undefined) updateData.contentIds = JSON.stringify(data.contentIds)
  if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate)
  if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate)
  if (data.startTime !== undefined) updateData.startTime = data.startTime
  if (data.endTime !== undefined) updateData.endTime = data.endTime
  if (data.repeat !== undefined) updateData.repeat = data.repeat.toUpperCase() as ScheduleRepeat
  if (data.status !== undefined) updateData.status = data.status.toUpperCase() as ScheduleStatus

  const schedule = await prisma.schedules.update({
    where: { id },
    data: updateData,
  })
  return convertSchedule(schedule)
}

export const deleteSchedule = async (id: string) => {
  await prisma.schedules.delete({ where: { id } })
}

// Activity operations
export const createActivity = async (userId: string, activityData: Partial<Activity>) => {
  const data = {
    id: crypto.randomUUID(),
    userId,
    type: (activityData.type?.toUpperCase() || 'SYSTEM') as ActivityType,
    action: activityData.action || '',
    description: activityData.description || '',
    metadata: activityData.metadata,
    timestamp: activityData.timestamp ? new Date(activityData.timestamp) : new Date(),
  }

  const activity = await prisma.activities.create({ data })
  return convertActivity(activity)
}

export const getUserActivities = async (userId: string, limitCount: number = 50) => {
  const activities = await prisma.activities.findMany({
    where: { userId },
    orderBy: { timestamp: 'desc' },
    take: limitCount,
  })
  return activities.map(convertActivity)
}

// Analytics operations
export const createAnalytics = async (userId: string, analyticsData: Partial<Analytics>) => {
  const data = {
    id: crypto.randomUUID(),
    userId,
    displayId: analyticsData.displayId,
    contentId: analyticsData.contentId,
    metric: analyticsData.metric || '',
    value: analyticsData.value || 0,
    timestamp: analyticsData.timestamp ? new Date(analyticsData.timestamp) : new Date(),
    date: analyticsData.date ? new Date(analyticsData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  }

  const analytics = await prisma.analytics.create({ data })
  return convertAnalytics(analytics)
}

export const getUserAnalytics = async (userId: string, startDate?: string, endDate?: string) => {
  const where: any = { userId }

  if (startDate) {
    where.date = { ...where.date, gte: new Date(startDate) }
  }
  if (endDate) {
    where.date = { ...where.date, lte: new Date(endDate) }
  }

  const analytics = await prisma.analytics.findMany({
    where,
    orderBy: { timestamp: 'desc' },
  })
  return analytics.map(convertAnalytics)
}

// User operations
export const createUser = async (userData: { firebaseId: string; email: string; name?: string; image?: string }) => {
  const user = await prisma.users.create({
    data: {
      id: crypto.randomUUID(),
      firebaseId: userData.firebaseId,
      email: userData.email,
      name: userData.name,
      image: userData.image,
      updatedAt: new Date(),
    },
  })
  return user
}

export const getUserByEmail = async (email: string) => {
  return await prisma.users.findUnique({
    where: { email },
  })
}

export const getUserById = async (id: string) => {
  return await prisma.users.findUnique({
    where: { id },
  })
}

export const getUserByFirebaseId = async (firebaseId: string) => {
  return await prisma.users.findUnique({
    where: { firebaseId },
  })
}

export const updateUser = async (id: string, data: Partial<User>) => {
  const updateData: any = {}

  if (data.name !== undefined) updateData.name = data.name
  if (data.image !== undefined) updateData.image = data.image

  return await prisma.users.update({
    where: { id },
    data: updateData,
  })
}