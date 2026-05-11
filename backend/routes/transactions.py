import secrets
import string
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import User, Product, Transaction
from jose import JWTError, jwt
from datetime import datetime, timedelta

router = APIRouter(prefix='/transactions', tags=['transactions'])

SECRET_KEY = 'thriftchain-secret-key'
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 60


def generate_tx_hash():
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(88))


def tokens_for_price(price: int, rate: float):
    return round((price / 10000) * rate, 2)


class BuyRequest(BaseModel):
    buyer_id: int
    product_id: int


class BuyRequestV2(BaseModel):
    buyer_id: int
    product_id: int
    quantity: int
    total_price: int


class SellRequest(BaseModel):
    seller_id: int
    name: str
    category: str
    size: str
    price: int
    photo_url: str


@router.post('/buy')
def buy_product(payload: BuyRequest, db: Session = Depends(get_db)):
    buyer = db.query(User).filter(User.id == payload.buyer_id).first()
    product = db.query(Product).filter(Product.id == payload.product_id, Product.status == 'available').first()
    if not buyer or not product:
        raise HTTPException(status_code=404, detail='Buyer atau produk tidak ditemukan')

    reward = tokens_for_price(product.price, 1.0)
    existing_count = db.query(Transaction).filter(Transaction.buyer_id == buyer.id).count()
    if existing_count == 0:
        reward += 50
    tx_hash = generate_tx_hash()
    tx = Transaction(
        buyer_id=buyer.id,
        seller_id=product.seller_id,
        product_id=product.id,
        price=product.price,
        tokens_earned=reward,
        tx_hash=tx_hash,
    )
    product.status = 'sold'
    buyer.thrift_tokens += reward
    db.add(tx)
    db.commit()
    return {'status': 'success', 'tx_hash': tx_hash, 'tokens_earned': reward}


@router.post('/')
def create_transaction(payload: BuyRequestV2, db: Session = Depends(get_db)):
    """Create transaction from frontend"""
    buyer = db.query(User).filter(User.id == payload.buyer_id).first()
    product = db.query(Product).filter(Product.id == payload.product_id, Product.status == 'available').first()
    
    if not buyer or not product:
        raise HTTPException(status_code=404, detail='Buyer atau produk tidak ditemukan')

    reward = tokens_for_price(product.price, 1.0) * payload.quantity
    existing_count = db.query(Transaction).filter(Transaction.buyer_id == buyer.id).count()
    if existing_count == 0:
        reward += 50
    
    tx_hash = generate_tx_hash()
    tx = Transaction(
        buyer_id=buyer.id,
        seller_id=product.seller_id,
        product_id=product.id,
        price=payload.total_price,
        tokens_earned=reward,
        tx_hash=tx_hash,
    )
    product.status = 'sold'
    buyer.thrift_tokens += reward
    seller = db.query(User).filter(User.id == product.seller_id).first()
    if seller:
        seller.thrift_tokens += tokens_for_price(product.price, 1.5) * payload.quantity
    
    db.add(tx)
    db.commit()
    return {'status': 'success', 'tx_hash': tx_hash, 'tokens_earned': reward, 'message': 'Transaksi berhasil'}


@router.get('/')
def get_user_transactions(authorization: str = Header(default=None), db: Session = Depends(get_db)):
    """Get user's transaction history"""
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail='Missing or invalid authorization header')

    token = authorization.replace('Bearer ', '')
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get('sub')
        if email is None:
            raise HTTPException(status_code=401, detail='Invalid token')
    except JWTError:
        raise HTTPException(status_code=401, detail='Invalid token')
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    
    transactions = db.query(Transaction).filter(
        (Transaction.buyer_id == user.id) | (Transaction.seller_id == user.id)
    ).order_by(Transaction.created_at.desc()).all()
    
    result = []
    for tx in transactions:
        result.append({
            'id': tx.id,
            'type': 'buy' if tx.buyer_id == user.id else 'sell',
            'product_name': tx.product.name if tx.product else 'Unknown Product',
            'tokens': tx.tokens_earned if tx.buyer_id == user.id else (tx.tokens_earned * 1.5),
            'created_at': tx.created_at.isoformat(),
            'tx_hash': tx.tx_hash,
            'price': tx.price
        })
    
    return result


@router.post('/sell')
def sell_item(payload: SellRequest, db: Session = Depends(get_db)):
    seller = db.query(User).filter(User.id == payload.seller_id).first()
    if not seller:
        raise HTTPException(status_code=404, detail='Seller tidak ditemukan')

    reward = tokens_for_price(payload.price, 1.5)
    existing_count = db.query(Transaction).filter(Transaction.seller_id == seller.id).count()
    if existing_count == 0:
        reward += 50

    product = Product(
        seller_id=seller.id,
        name=payload.name,
        category=payload.category,
        size=payload.size,
        price=payload.price,
        photo_url=payload.photo_url,
    )
    db.add(product)
    db.commit()

    tx = Transaction(
        buyer_id=None,
        seller_id=seller.id,
        product_id=product.id,
        price=payload.price,
        tokens_earned=reward,
        tx_hash=generate_tx_hash(),
    )
    seller.thrift_tokens += reward
    db.add(tx)
    db.commit()
    return {'status': 'success', 'product_id': product.id, 'tokens_earned': reward}
