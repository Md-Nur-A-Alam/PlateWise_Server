import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse, ApiError } from '../utils/apiResponse';

export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, 'No image file provided');
  }

  const apiKey = process.env.IMG_BB;
  if (!apiKey) {
    throw new ApiError(500, 'IMG_BB API key not configured');
  }

  const formData = new FormData();
  // ImgBB API expects a base64 encoded string or multipart form data.
  // Using native fetch, we can convert the buffer to a Blob and append it.
  const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
  formData.append('image', blob, req.file.originalname);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new ApiError(502, result.error?.message || 'Failed to upload image to ImgBB');
  }

  res.status(200).json(new ApiResponse(200, {
    url: result.data.url,
    delete_url: result.data.delete_url
  }, 'Image uploaded successfully'));
});
