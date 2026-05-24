export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { responseUrl } = req.body

  const resp = await fetch(responseUrl, {
    headers: {
      'Authorization': `Key ${process.env.FAL_KEY}`,
    },
  })

  const data = await resp.json()
  res.json(data)
}