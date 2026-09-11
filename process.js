module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { videoUrl, x, y, frameIndex = 0, fps = 30 } = req.body || {};
    if (!videoUrl || x == null || y == null) return res.status(400).json({ error: 'Missing input' });
    if (!process.env.REPLICATE_API_TOKEN) return res.status(500).json({ error: 'REPLICATE_API_TOKEN is not configured' });

    const r = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: '33432afdfc06a10da6b4018932893d39b0159f838b6d11dd1236dff85cc5ec1d',
        input: {
          input_video: videoUrl,
          click_coordinates: `[${Math.round(x)},${Math.round(y)}]`,
          click_labels: '1',
          click_frames: String(Math.max(0, Math.round(frameIndex))),
          click_object_ids: 'idol',
          mask_type: 'highlighted',
          annotation_type: 'mask',
          output_video: true,
          video_fps: Math.max(1, Math.min(60, Math.round(fps))),
          output_frame_interval: 1
        }
      })
    });
    const j = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: j.detail || j.error || 'Replicate error' });
    res.status(200).json({ id: j.id, status: j.status });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
