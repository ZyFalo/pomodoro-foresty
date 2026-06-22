import { NextRequest } from 'next/server';
import { withAdmin } from '@/lib/auth/middleware';
import { v2 as cloudinary } from 'cloudinary';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

// POST /api/upload — sube una imagen a Cloudinary (solo admin) y devuelve su URL.
export const POST = withAdmin(async (req: NextRequest) => {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    return Response.json(
      { error: 'El servicio de imágenes no está configurado' },
      { status: 503 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return Response.json({ error: 'Petición inválida' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return Response.json({ error: 'No se envió ningún archivo' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return Response.json(
      { error: 'Formato no soportado. Usa PNG, JPG o WebP' },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return Response.json(
      { error: 'La imagen supera el tamaño máximo de 5MB' },
      { status: 400 }
    );
  }

  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
  });

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'pomodoro-forest/trees',
      resource_type: 'image',
      // Tamaño máximo recomendado para árboles: 500x500 manteniendo proporción
      transformation: [{ width: 500, height: 500, crop: 'limit' }],
    });
    return Response.json(
      { url: result.secure_url, public_id: result.public_id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return Response.json({ error: 'Error al subir la imagen' }, { status: 502 });
  }
});
