export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { statusUrl } = req.body

  const resp = await fetch(statusUrl, {
    headers: {
      'Authorization': `Key ${process.env.FAL_KEY}`,
    },
  })

  const data = await resp.json()
  res.json(data)
}