export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { imageBase64, mimeType } = req.body
  if (!imageBase64) return res.status(400).json({ error: 'No image provided' })

  try {
    const buffer = Buffer.from(imageBase64, 'base64')
    const blob = new Blob([buffer], { type: mimeType || 'image/jpeg' })

    const form = new FormData()
    form.append('file', blob, 'upload.jpg')

    const resp = await fetch('https://upload.fal.run/files', {
      method: 'POST',
      headers: { 'Authorization': `Key ${process.env.FAL_KEY}` },
      body: form,
    })

    if (!resp.ok) {
      const err = await resp.text()
      return res.status(resp.status).json({ error: `fal upload failed: ${err}` })
    }

    const data = await resp.json()
    res.json({ url: data.url })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
