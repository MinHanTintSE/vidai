export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const resp = await fetch(`https://queue.fal.run/${req.body.endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${process.env.FAL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req.body.payload),
  })

  const data = await resp.json()
  res.json(data)
}