const { put } = require('@vercel/blob');

module.exports = async function handler(req, res) {

  if (req.method !== 'GET') {

    return res.status(405).json({

      ok: false,

      error: 'Method not allowed'

    });

  }

  try {

    const body = `idol-mosaic blob test ${new Date().toISOString()}`;

    const blob = await put(

      `diagnostics/blob-test-${Date.now()}.txt`,

      body,

      {

        access: 'public',

        addRandomSuffix: true

      }

    );

    return res.status(200).json({

      ok: true,

      message: 'Vercel Blob server-side write succeeded',

      url: blob.url

    });

  } catch (error) {

    console.error('blobtest failed', error);

    return res.status(500).json({

      ok: false,

      error: error?.message || String(error)

    });

  }

};
