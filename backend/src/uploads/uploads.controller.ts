import { Controller, Post, Req, Res, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

/**
 * Public endpoint used by @vercel/blob/client's `upload()` on the frontend.
 *
 * Two phases land here:
 *   1. "blob.generate-client-token" — issue a signed token bound to a path
 *      and content-type so the browser can PUT directly to Vercel Blob.
 *   2. "blob.upload-completed" — Vercel calls back once the upload finishes.
 *      We do nothing here today; placeholder for future cleanup / DB write.
 *
 * Auth: intentionally public. Reference-photo uploads happen during the
 * anonymous booking flow before a customer record exists. Abuse mitigation
 * lives in the path-prefix + content-type allowlist below, not in auth.
 */
@Controller('uploads')
export class UploadsController {
  @Post('blob-token')
  async blobToken(@Req() req: Request, @Res() res: Response) {
    const body = req.body as HandleUploadBody;
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      throw new HttpException(
        'BLOB_READ_WRITE_TOKEN not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      const jsonResponse = await handleUpload({
        body,
        request: req as unknown as Request,
        token,
        onBeforeGenerateToken: async (pathname) => {
          // pathname is supplied by the client. We constrain the prefix so a
          // stray caller can't overwrite arbitrary blobs in our store.
          if (!pathname.startsWith('booking-intake/')) {
            throw new Error('Uploads must target booking-intake/ prefix');
          }
          return {
            allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
            maximumSizeInBytes: 15 * 1024 * 1024, // 15MB — phones produce big JPEGs
            // tokenPayload is round-tripped to onUploadCompleted; we don't need it yet.
            tokenPayload: JSON.stringify({ pathname }),
          };
        },
        onUploadCompleted: async () => {
          // Vercel calls this after the browser finishes its PUT.
          // We don't persist anything server-side — the frontend stores the
          // returned blob URL in Booking.intakeData / Vehicle.photos directly.
        },
      });
      return res.status(HttpStatus.OK).json(jsonResponse);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload token failed';
      return res.status(HttpStatus.BAD_REQUEST).json({ error: message });
    }
  }
}
