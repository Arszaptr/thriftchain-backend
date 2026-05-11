// ✅ Gunakan environment variable untuk URL backend
// Di production (Vercel): set NEXT_PUBLIC_API_URL ke URL Railway/Render Anda
// Di development: otomatis pakai localhost:8000

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
