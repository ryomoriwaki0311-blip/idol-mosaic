const { issueSignedToken, presignUrl } = require('@vercel/blob');

const ALLOWED_TYPES = new Set([

  'video/mp4',

  'video/quicktime',

  'video/x-m4v',

  'application/octet-stream',

]);

function safeExt(value) {

  const ext = String(value || 'mp4')

    .toLowerCase()

    .replace(/[^a-z0-9]/g, '');

  return ext || 'mp4';

}

function publicBlobUrl(pathname) {

  let storeId = process.env.BLOB_STORE_ID || '';

  storeId = storeId.replace(/^store_/, '');

  if (!storeId) {

    return null;

  }

  const encodedPath = pathname

    .split('/')

    .map(encodeURIComponent)

    .join('/');

  return `https://${storeId}.public.blob.vercel-storage.com/${encodedPath}`;

}

module.exports = async function handler(req, res) {

  if (req.method !== 'POST') {

    return res.status(405).json({

      ok: false,

      error: 'Method not allowed'

    });

  }

  try {

    const {

      contentType,

      size,

      extension

    } = req.body || {};

    const type = ALLOWED_TYPES.has(contentType)

      ? contentType

      : 'application/octet-stream';

    const maxBytes = 1024 * 1024 * 1024;

    const fileSize = Number(size || 0);

    if (!Number.isFinite(fileSize) || fileSize <= 0) {

      return res.status(400).json({

        ok: false,

        error: 'Invalid file size'

      });

    }

    if (fileSize > maxBytes) {

      return res.status(400).json({

        ok: false,

        error: 'File is too large (max 1GB)'

      });

    }

    const ext = safeExt(extension);

    const pathname =

      `idol-mosaic/${Date.now()}-` +

      `${Math.random().toString(36).slice(2, 10)}.${ext}`;

    const validUntil =

      Date.now() + 15 * 60 * 1000;

    const signedToken =

      await issueSignedToken({

        pathname,

        operations: ['put'],

        validUntil,

        allowedContentTypes: [type],

        maximumSizeInBytes: maxBytes

      });

    const {

      presignedUrl

    } = await presignUrl(

      signedToken,

      {

        operation: 'put',

        pathname,

        access: 'public',

        validUntil,

        allowedContentTypes: [type],

        maximumSizeInBytes: maxBytes,

        addRandomSuffix: false,

        allowOverwrite: false

      }

    );

    return res.status(200).json({

      ok: true,

      pathname,

      presignedUrl,

      blobUrl: publicBlobUrl(pathname),

      expiresAt: validUntil

    });

  } catch (error) {

    console.error(

      'presign upload failed',

      error

    );

    return res.status(500).json({

      ok: false,

      error:

        error?.message ||

        String(error)

    });

  }

};
