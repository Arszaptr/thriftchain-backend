from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd

router = APIRouter(prefix='/recommend', tags=['recommend'])

class RecommendRequest(BaseModel):
    category: Optional[str] = None
    size: Optional[str] = None
    min_price: Optional[int] = None
    max_price: Optional[int] = None

products = [
    {'id': 1, 'name': 'Kemeja Flannel Vintage', 'category': 'Atasan', 'size': 'M', 'price': 65000, 'photo_url': 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f'},
    {'id': 2, 'name': 'Hoodie Oversized Y2K', 'category': 'Outerwear', 'size': 'L', 'price': 120000, 'photo_url': 'https://images.unsplash.com/photo-1520975916514-2e3f4c8a3145'},
    {'id': 3, 'name': 'Celana Jeans 90s', 'category': 'Bawahan', 'size': 'M', 'price': 95000, 'photo_url': 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f'},
    {'id': 4, 'name': 'Dress Satin Mini', 'category': 'Dress', 'size': 'S', 'price': 85000, 'photo_url': 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f'},
    {'id': 5, 'name': 'Top Crop Retro', 'category': 'Atasan', 'size': 'XS', 'price': 42000, 'photo_url': 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f'},
    {'id': 6, 'name': 'Jaket Denim Classic', 'category': 'Outerwear', 'size': 'XL', 'price': 135000, 'photo_url': 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f'},
    {'id': 7, 'name': 'Rok Plisket Vintage', 'category': 'Bawahan', 'size': 'S', 'price': 58000, 'photo_url': 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f'},
    {'id': 8, 'name': 'T-Shirt Band Retro', 'category': 'Atasan', 'size': 'L', 'price': 47000, 'photo_url': 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f'},
    {'id': 9, 'name': 'Blazer Hitam Modern', 'category': 'Outerwear', 'size': 'M', 'price': 140000, 'photo_url': 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f'},
    {'id': 10, 'name': 'Sweater Rajut Cozy', 'category': 'Outerwear', 'size': 'XL', 'price': 78000, 'photo_url': 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f'},
]

@router.post('/')
def recommend(payload: RecommendRequest):
    df = pd.DataFrame(products)
    df['feature'] = df['name'] + ' ' + df['category'] + ' ' + df['size']
    vectorizer = TfidfVectorizer(stop_words='english')
    matrix = vectorizer.fit_transform(df['feature'])

    query_parts = []
    if payload.category:
        query_parts.append(payload.category)
    if payload.size:
        query_parts.append(payload.size)
    if payload.min_price is not None and payload.max_price is not None:
        query_parts.append(f'{payload.min_price} {payload.max_price}')

    query_text = ' '.join(query_parts) if query_parts else 'thrift fashion'
    query_vec = vectorizer.transform([query_text])
    similarity = cosine_similarity(query_vec, matrix).flatten()
    df['score'] = similarity

    if payload.min_price is not None:
        df = df[df['price'] >= payload.min_price]
    if payload.max_price is not None:
        df = df[df['price'] <= payload.max_price]

    results = df.sort_values('score', ascending=False).head(6).to_dict(orient='records')
    return {'recommendations': results}
