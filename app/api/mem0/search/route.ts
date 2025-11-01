import { NextRequest, NextResponse } from 'next/server'
import { searchMemories } from '@/lib/mem0'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { query, userId, dateFilter } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'UserId is required' }, { status: 400 })
    }

    const results = await searchMemories(query, userId, dateFilter)
    console.log('[API] Search complete', { resultCount: results.length })

    return NextResponse.json({ results })
  } catch (error: any) {
    console.error('[API] Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to search' }, { status: 500 })
  }
}

