import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  // Verify user is logged in
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Sign in required to generate videos' })

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Invalid session — please sign in again' })

  const { endpoint, payload } = req.body

  console.log('[generate] user:', user.email)
  console.log('[generate] endpoint:', endpoint)
  console.log('[generate] payload:', JSON.stringify(payload))

  const resp = await fetch(`https://queue.fal.run/${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${process.env.FAL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await resp.json()
  console.log('[generate] fal status:', resp.status)
  console.log('[generate] fal response:', JSON.stringify(data))

  res.status(resp.status).json(data)
}
