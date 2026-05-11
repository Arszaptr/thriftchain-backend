from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError, jwt
from pydantic import BaseModel
from hashlib import pbkdf2_hmac
import secrets
from sqlalchemy.orm import Session
from database import get_db
from models import User

router = APIRouter(prefix='/auth', tags=['auth'])

SECRET_KEY = 'thriftchain-secret-key'
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 60


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    hashed = pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
    return f'{salt}${hashed.hex()}'


def verify_password(plain_password: str, password_hash: str) -> bool:
    try:
        salt, hashed = password_hash.split('$')
        return pbkdf2_hmac('sha256', plain_password.encode(), salt.encode(), 100000).hex() == hashed
    except:
        return False


class Token(BaseModel):
    access_token: str
    token_type: str


class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    wallet_address: str


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({'exp': expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@router.post('/register')
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter((User.email == payload.email) | (User.username == payload.username)).first()
    if existing:
        raise HTTPException(status_code=400, detail='Pengguna sudah terdaftar')

    user = User(
        username=payload.username,
        email=payload.email,
        password_hash=hash_password(payload.password),
        wallet_address=payload.wallet_address,
        thrift_tokens=0,
        tier='Bronze',
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({'sub': user.email})
    return {'access_token': token, 'token_type': 'bearer', 'user': {'id': user.id, 'email': user.email, 'username': user.username, 'wallet_address': user.wallet_address}}


@router.post('/login', response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail='Username atau password salah')

    access_token = create_access_token({'sub': user.email})
    return {'access_token': access_token, 'token_type': 'bearer'}


def get_current_user(token: str = Depends(lambda: None), db: Session = Depends(get_db)):
    """Get current user from JWT token in Authorization header"""
    from fastapi.security import HTTPBearer, HTTPAuthCredentials
    from fastapi import Header
    
    auth_header = Header(default=None)
    
    if not token:
        raise HTTPException(status_code=401, detail='Not authenticated')
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get('sub')
        if email is None:
            raise HTTPException(status_code=401, detail='Invalid token')
    except JWTError:
        raise HTTPException(status_code=401, detail='Invalid token')
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail='User not found')
    
    return user


@router.get('/me')
def get_me(authorization: str = Header(None), db: Session = Depends(get_db)):
    """Get current user info - requires Bearer token"""
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
    
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'wallet_address': user.wallet_address,
        'thrift_tokens': user.thrift_tokens,
        'tier': user.tier,
        'created_at': user.created_at.isoformat() if user.created_at else None,
    }


@router.get('/user/{user_id}')
def get_user_by_id(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'wallet_address': user.wallet_address,
        'thrift_tokens': user.thrift_tokens,
        'tier': user.tier,
        'created_at': user.created_at.isoformat() if user.created_at else None,
    }


@router.post('/logout')
def logout():
    """Logout - token invalidation handled on client side"""
    return {'message': 'Logged out successfully'}
