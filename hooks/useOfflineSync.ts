'use client'

import { useEffect, useState } from 'react'
import { getUnsyncedConversations, removeSyncedConversation } from '@/lib/offlineStorage'
import { isValidConversation } from '@/lib/validation'

const DEFAULT_USER_ID = 'default_user_id'

export function useOfflineSync() {
    const [isSyncing, setIsSyncing] = useState(false)
    const [pendingCount, setPendingCount] = useState(0)

    const syncData = async () => {
        if (!navigator.onLine) return

        const unsyncedConversations = getUnsyncedConversations()
        if (unsyncedConversations.length === 0) return

        setIsSyncing(true)

        for (const stored of unsyncedConversations) {
            // Skip invalid conversations
            if (!isValidConversation(stored.conversation)) {
                console.log('[Sync] Removing invalid conversation:', stored.id)
                removeSyncedConversation(stored.id)
                continue
            }

            try {
                const [extractResponse, mem0Response] = await Promise.all([
                    fetch('/api/extract-exercises', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ conversation: stored.conversation }),
                    }),
                    fetch('/api/mem0/save', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            conversation: stored.conversation,
                            userId: DEFAULT_USER_ID,
                        }),
                    })
                ])

                if (extractResponse.ok && mem0Response.ok) {
                    removeSyncedConversation(stored.id)
                    console.log('[Sync] ✓ Synced:', stored.id)
                } else if (extractResponse.status === 400 || mem0Response.status === 400) {
                    // Remove invalid data that will never sync successfully
                    console.log('[Sync] Removing conversation with 400 error:', stored.id)
                    removeSyncedConversation(stored.id)
                } else {
                    console.error('[Sync] Error syncing:', stored.id, {
                        extractStatus: extractResponse.status,
                        mem0Status: mem0Response.status
                    })
                }
            } catch (err) {
                console.error('[Sync] Failed:', stored.id, err)
            }
        }

        setPendingCount(getUnsyncedConversations().length)
        setIsSyncing(false)
    }

    useEffect(() => {
        setPendingCount(getUnsyncedConversations().length)

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

