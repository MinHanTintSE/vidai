export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { endpoint, payload } = req.body

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
