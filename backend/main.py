from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, Response
from database import engine, Base, SessionLocal
from routes.auth import router as auth_router
from routes.products import router as products_router
from routes.transactions import router as transactions_router
from routes.rewards import router as rewards_router
from routes.ai_recommend import router as ai_router
from routes.vouchers import router as vouchers_router
from models import User, Product, Voucher
from datetime import datetime, timedelta
from hashlib import pbkdf2_hmac
import secrets
import os
from sqlalchemy.orm import Session
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title='ThriftChain API')

# ✅ CORS: support localhost (dev) + Vercel (production)
FRONTEND_URL = os.environ.get("FRONTEND_URL", "")
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if FRONTEND_URL:
    allowed_origins.append(FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",  # semua subdomain vercel
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(auth_router)
app.include_router(products_router)
app.include_router(transactions_router)
app.include_router(rewards_router)
app.include_router(ai_router)
app.include_router(vouchers_router)


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    hashed = pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
    return f'{salt}${hashed.hex()}'


def seed_data():
    db: Session = SessionLocal()
    try:
        demo_user = db.query(User).filter(User.email == 'demo@thriftchain.id').first()
        if not demo_user:
            users = [
                User(username='demo', email='demo@thriftchain.id', password_hash=hash_password('demo123'), wallet_address='demo-wallet-1', thrift_tokens=250, tier='Silver'),
                User(username='seller', email='seller@thriftchain.id', password_hash=hash_password('seller123'), wallet_address='seller-wallet-1', thrift_tokens=1500, tier='Gold'),
                User(username='admin', email='admin@thriftchain.id', password_hash=hash_password('admin123'), wallet_address='admin-wallet-1', thrift_tokens=5000, tier='Diamond'),
            ]
            db.add_all(users)
            db.commit()

        product_count = db.query(Product).count()
        if product_count == 0:
            products = [
                Product(seller_id=1, name='Kemeja Flannel Vintage', category='Atasan', size='M', price=65000, photo_url='https://images.unsplash.com/photo-1512436991641-6745cdb1723f'),
                Product(seller_id=1, name='Hoodie Oversized Y2K', category='Outerwear', size='L', price=120000, photo_url='https://images.unsplash.com/photo-1520975916514-2e3f4c8a3145'),
                Product(seller_id=2, name='Celana Jeans 90s', category='Bawahan', size='M', price=95000, photo_url='https://images.unsplash.com/photo-1512436991641-6745cdb1723f'),
                Product(seller_id=2, name='Dress Satin Mini', category='Dress', size='S', price=85000, photo_url='https://images.unsplash.com/photo-1512436991641-6745cdb1723f'),
                Product(seller_id=3, name='Top Crop Retro', category='Atasan', size='XS', price=42000, photo_url='https://images.unsplash.com/photo-1512436991641-6745cdb1723f'),
                Product(seller_id=3, name='Jaket Denim Classic', category='Outerwear', size='XL', price=135000, photo_url='https://images.unsplash.com/photo-1512436991641-6745cdb1723f'),
            ]
            db.add_all(products)
            db.commit()

        voucher_count = db.query(Voucher).count()
        if voucher_count == 0:
            vouchers = [
                Voucher(code='THRIFT10', discount_percentage=10, min_purchase=50000, max_discount=30000, valid_until=datetime.utcnow() + timedelta(days=30)),
                Voucher(code='ECO25', discount_percentage=25, min_purchase=120000, max_discount=50000, valid_until=datetime.utcnow() + timedelta(days=45)),
                Voucher(code='NEWUSER5', discount_percentage=5, min_purchase=0, max_discount=15000, valid_until=datetime.utcnow() + timedelta(days=90)),
            ]
            db.add_all(vouchers)
            db.commit()
    finally:
        db.close()


@app.on_event('startup')
def on_startup():
    logger.info('🚀 Creating database tables...')
    Base.metadata.create_all(bind=engine)
    logger.info('✅ Tables created')
    logger.info('🌱 Seeding data...')
    seed_data()
    logger.info('✅ Data seeded')


@app.get('/')
def root():
    return {
        'message': 'ThriftChain API is running.',
        'docs': '/docs',
    }


@app.get('/health')
def health_check():
    return {'status': 'ok', 'project': 'ThriftChain', 'message': 'Backend is running!'}


@app.get('/favicon.ico', include_in_schema=False)
def favicon() -> Response:
    return Response(status_code=204)


if __name__ == '__main__':
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    logger.info(f'🚀 Starting ThriftChain Backend on port {port}')
    uvicorn.run(app, host='0.0.0.0', port=port, log_level='info')
