export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_DAILY_API_KEY}`
      },
      body: JSON.stringify({
        properties: {
          exp: Math.round(Date.now() / 1000) + 3600,
          enable_screenshare: true,
          enable_recording: 'local',
          start_video_off: false,
          start_audio_off: false,
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: 'Failed to create room' });
  }
}
```

---

## How to Add This File on GitHub

**Step 1** — Go to your UbuntuMeet repository on github.com

**Step 2** — Click **"Add file"** → **"Create new file"**

**Step 3** — In the filename box at the top, type exactly:
```
api/create-room.js
