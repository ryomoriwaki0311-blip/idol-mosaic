const { handleUpload } = require('@vercel/blob/client');

module.exports = async function handler(req, res) {

  if (req.method !== 'POST') {

    return res.status(405).json({ error: 'Method not allowed' });

  }

  try {

    const jsonResponse = await handleUpload({

      body: req.body,

      request: req,

      onBeforeGenerateToken: async () => ({

        allowedContentTypes: [

          'video/mp4',

          'video/quicktime',

          'video/x-m4v',

          'application/octet-stream',

        ],

        maximumSizeInBytes: 1024 * 1024 * 1024,

        addRandomSuffix: true,

      }),

      onUploadCompleted: async () => {},

    });

    return res.status(200).json(jsonResponse);

  } catch (error) {

    return res.status(400).json({

      error: error.message,

    });

  }

};
