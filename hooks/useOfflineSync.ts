'use client'

import { useEffect, useState } from 'react'
import {
    getUnsyncedConversations,
    removeSyncedConversation,
} from '@/lib/offlineStorage'

const DEFAULT_USER_ID = 'default_user_id'

export function useOfflineSync() {
    const [isSyncing, setIsSyncing] = useState(false)
    const [pendingCount, setPendingCount] = useState(0)

    const syncData = async () => {
        if (!navigator.onLine) return

        setIsSyncing(true)

        try {
            const unsyncedConversations = await getUnsyncedConversations()
            if (unsyncedConversations.length === 0) {
                setIsSyncing(false)
                return
            }

            console.log('[Sync] Syncing', unsyncedConversations.length, 'conversations')

            for (const stored of unsyncedConversations) {
                try {
                    let extractSuccess = false
                    let mem0Success = false

                     try {
                         const extractResponse = await fetch('/api/extract-exercises', {
                             method: 'POST',
                             headers: { 'Content-Type': 'application/json' },
                             body: JSON.stringify({ conversation: stored.conversation }),
                         })
                         extractSuccess = extractResponse.ok
                     } catch (err) {
                         console.error('[Sync] Extract failed:', err)
                     }

                     try {
                         const mem0Response = await fetch('/api/mem0/save', {
                             method: 'POST',
                             headers: { 'Content-Type': 'application/json' },
                             body: JSON.stringify({
                                 conversation: stored.conversation,
                                 userId: DEFAULT_USER_ID,
                             }),
                         })
                         mem0Success = mem0Response.ok
                     } catch (err) {
                         console.error('[Sync] Mem0 failed:', err)
                     }

                     if (extractSuccess && mem0Success) {
                         await removeSyncedConversation(stored.id)
                         console.log('[Sync] ✓ Synced:', stored.id)
                     }
                 } catch (err) {
                     console.error('[Sync] Error:', err)
                 }
             }

             await updatePendingCount()
         } catch (err) {
             console.error('[Sync] Error:', err)
         } finally {
             setIsSyncing(false)
         }
     }

    const updatePendingCount = async () => {
        try {
            const conversations = await getUnsyncedConversations()
            setPendingCount(conversations.length)
        } catch (err) {
            console.error('[Sync] Error updating pending count:', err)
        }
    }

    useEffect(() => {
        updatePendingCount()

        const handleOnline = () => syncData()
        window.addEventListener('online', handleOnline)

        const syncInterval = setInterval(() => {
            if (navigator.onLine) syncData()
        }, 60000)

        return () => {
            window.removeEventListener('online', handleOnline)
            clearInterval(syncInterval)
        }
    }, [])

    return {
        isSyncing,
        pendingCount,
        syncNow: syncData,
    }
}

