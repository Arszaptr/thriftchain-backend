from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from database import get_db
from models import Product, User

router = APIRouter(prefix='/products', tags=['products'])


class ProductCreate(BaseModel):
    seller_id: int
    name: str
    category: str
    size: str
    price: int
    photo_url: str


class ProductOut(BaseModel):
    id: int
    seller_id: int
    name: str
    category: str
    size: str
    price: int
    photo_url: str
    status: str

    class Config:
        from_attributes = True


@router.get('/', response_model=List[ProductOut])
def get_products(db: Session = Depends(get_db)):
    products = db.query(Product).filter(Product.status == 'available').all()
    return products


@router.get('/{product_id}', response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail='Produk tidak ditemukan')
    return product


@router.post('/')
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    seller = db.query(User).filter(User.id == payload.seller_id).first()
    if not seller:
        raise HTTPException(status_code=404, detail='Seller tidak ditemukan')
    product = Product(
        seller_id=payload.seller_id,
        name=payload.name,
        category=payload.category,
        size=payload.size,
        price=payload.price,
        photo_url=payload.photo_url,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return {'status': 'success', 'product_id': product.id}
