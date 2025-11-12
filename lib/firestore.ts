import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Display, ContentItem, Schedule, Activity, Analytics } from './types'

// Generic CRUD operations
export const createDocument = async <T extends DocumentData>(
  collectionName: string,
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
) => {
  const docData = {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const docRef = await addDoc(collection(db, collectionName), docData)
  return { id: docRef.id, ...docData } as T
}

export const getDocument = async <T extends DocumentData>(collectionName: string, id: string) => {
  const docRef = doc(db, collectionName, id)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as T
  }
  return null
}

export const updateDocument = async <T extends DocumentData>(
  collectionName: string,
  id: string,
  data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>
) => {
  const docRef = doc(db, collectionName, id)
  
  // Filter out undefined values to avoid Firestore errors
  const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value
    }
    return acc
  }, {} as Record<string, any>)
  
  const updateData = {
    ...cleanData,
    updatedAt: new Date().toISOString(),
  }
  
  await updateDoc(docRef, updateData)
  return { id, ...updateData }
}

export const deleteDocument = async (collectionName: string, id: string) => {
  const docRef = doc(db, collectionName, id)
  await deleteDoc(docRef)
}

export const getDocuments = async <T extends DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = []
) => {
  const q = query(collection(db, collectionName), ...constraints)
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as T[]
}

// Realtime listener
export const subscribeToCollection = <T extends DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[],
  callback: (data: T[]) => void
) => {
  const q = query(collection(db, collectionName), ...constraints)

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[]
    callback(data)
  })
}

export const subscribeToDocument = <T extends DocumentData>(
  collectionName: string,
  id: string,
  callback: (data: T | null) => void
) => {
  const docRef = doc(db, collectionName, id)

  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as T)
    } else {
      callback(null)
    }
  })
}

// Display-specific operations
export const createDisplay = async (userId: string, displayData: Partial<Display>) => {
  console.log('[createDisplay] Creating display for user:', userId, 'with data:', displayData)
  const result = await createDocument<Display>('displays', { ...displayData, userId } as Omit<Display, 'id' | 'createdAt' | 'updatedAt'>)
  console.log('[createDisplay] Created display:', result)
  return result
}

export const getUserDisplays = (userId: string) =>
  getDocuments<Display>('displays', [where('userId', '==', userId), orderBy('createdAt', 'desc')])

export const updateDisplay = (id: string, data: Partial<Display>) => updateDocument<Display>('displays', id, data)

export const deleteDisplay = (id: string) => deleteDocument('displays', id)

export const subscribeToDisplays = (userId: string, callback: (displays: Display[]) => void) =>
  subscribeToCollection<Display>('displays', [where('userId', '==', userId), orderBy('createdAt', 'desc')], callback)

// Content-specific operations
export const createContent = (userId: string, contentData: Partial<ContentItem>) =>
  createDocument<ContentItem>('content', { ...contentData, userId } as Omit<
    ContentItem,
    'id' | 'createdAt' | 'updatedAt'
  >)

export const getUserContent = (userId: string) =>
  getDocuments<ContentItem>('content', [where('userId', '==', userId), orderBy('createdAt', 'desc')])

export const updateContent = (id: string, data: Partial<ContentItem>) =>
  updateDocument<ContentItem>('content', id, data)

export const deleteContent = (id: string) => deleteDocument('content', id)

export const subscribeToContent = (userId: string, callback: (content: ContentItem[]) => void) =>
  subscribeToCollection<ContentItem>('content', [where('userId', '==', userId), orderBy('createdAt', 'desc')], callback)

// Schedule-specific operations
export const createSchedule = (userId: string, scheduleData: Partial<Schedule>) =>
  createDocument<Schedule>('schedules', { ...scheduleData, userId } as Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>)

export const getUserSchedules = (userId: string) =>
  getDocuments<Schedule>('schedules', [where('userId', '==', userId), orderBy('createdAt', 'desc')])

export const updateSchedule = (id: string, data: Partial<Schedule>) => updateDocument<Schedule>('schedules', id, data)

export const deleteSchedule = (id: string) => deleteDocument('schedules', id)

export const subscribeToSchedules = (userId: string, callback: (schedules: Schedule[]) => void) =>
  subscribeToCollection<Schedule>('schedules', [where('userId', '==', userId), orderBy('createdAt', 'desc')], callback)

// Activity-specific operations
export const createActivity = (userId: string, activityData: Partial<Activity>) =>
  createDocument<Activity>('activities', {
    ...activityData,
    userId,
    timestamp: new Date().toISOString(),
  } as Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>)

export const getUserActivities = (userId: string, limitCount: number = 50) =>
  getDocuments<Activity>('activities', [
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(limitCount),
  ])

export const subscribeToActivities = (userId: string, callback: (activities: Activity[]) => void, limitCount = 50) =>
  subscribeToCollection<Activity>(
    'activities',
    [where('userId', '==', userId), orderBy('timestamp', 'desc'), limit(limitCount)],
    callback
  )

// Analytics-specific operations
export const createAnalytics = (userId: string, analyticsData: Partial<Analytics>) =>
  createDocument<Analytics>('analytics', {
    ...analyticsData,
    userId,
    timestamp: new Date().toISOString(),
    date: new Date().toISOString().split('T')[0],
  } as Omit<Analytics, 'id' | 'createdAt' | 'updatedAt'>)

export const getUserAnalytics = (userId: string, startDate?: string, endDate?: string) => {
  const constraints: QueryConstraint[] = [where('userId', '==', userId)]

  if (startDate) {
    constraints.push(where('date', '>=', startDate))
  }
  if (endDate) {
    constraints.push(where('date', '<=', endDate))
  }

  constraints.push(orderBy('timestamp', 'desc'))

  return getDocuments<Analytics>('analytics', constraints)
}
