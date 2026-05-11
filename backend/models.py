from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    wallet_address = Column(String, unique=True, index=True, nullable=False)
    thrift_tokens = Column(Float, default=0.0)
    tier = Column(String, default='Bronze')
    created_at = Column(DateTime, default=datetime.utcnow)

    products = relationship('Product', back_populates='seller')
    transactions_as_buyer = relationship('Transaction', foreign_keys='Transaction.buyer_id', back_populates='buyer')
    transactions_as_seller = relationship('Transaction', foreign_keys='Transaction.seller_id', back_populates='seller')
    cashouts = relationship('Cashout', back_populates='user')


class Product(Base):
    __tablename__ = 'products'

    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey('users.id'))
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    size = Column(String, nullable=False)
    price = Column(Integer, nullable=False)
    photo_url = Column(String, nullable=False)
    status = Column(String, default='available')
    created_at = Column(DateTime, default=datetime.utcnow)

    seller = relationship('User', back_populates='products')
    transactions = relationship('Transaction', back_populates='product')


class Transaction(Base):
    __tablename__ = 'transactions'

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    seller_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=True)
    price = Column(Integer, nullable=False)
    tokens_earned = Column(Float, nullable=False)
    tx_hash = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    buyer = relationship('User', foreign_keys=[buyer_id], back_populates='transactions_as_buyer')
    seller = relationship('User', foreign_keys=[seller_id], back_populates='transactions_as_seller')
    product = relationship('Product', back_populates='transactions')


class Cashout(Base):
    __tablename__ = 'cashouts'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    tokens_used = Column(Float, nullable=False)
    amount_rp = Column(Integer, nullable=False)
    method = Column(String, nullable=False)
    account = Column(String, nullable=False)
    status = Column(String, default='success')
    ref_number = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship('User', back_populates='cashouts')


class Voucher(Base):
    __tablename__ = 'vouchers'

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)
    discount_percentage = Column(Integer)
    min_purchase = Column(Integer, default=0)
    max_discount = Column(Integer, nullable=True)
    valid_until = Column(DateTime)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
