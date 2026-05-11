from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from database import get_db
from models import Voucher, User
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import List

router = APIRouter(prefix='/vouchers', tags=['vouchers'])

SECRET_KEY = 'thriftchain-secret-key'
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 60

class VoucherCreate(BaseModel):
    code: str
    discount_percentage: int
    min_purchase: int = 0
    max_discount: int = None
    valid_until: datetime

class VoucherResponse(BaseModel):
    id: int
    code: str
    discount_percentage: int
    min_purchase: int
    max_discount: int = None
    valid_until: datetime
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class VoucherValidationRequest(BaseModel):
    code: str
    purchase_amount: int


def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Missing or invalid authorization header',
            headers={'WWW-Authenticate': 'Bearer'},
        )

    token = authorization.replace('Bearer ', '')
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get('sub')
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token')
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token')

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='User not found')
    return user

@router.get('/', response_model=List[VoucherResponse])
async def get_active_vouchers(db: Session = Depends(get_db)):
    """Get all active vouchers"""
    vouchers = db.query(Voucher).filter(
        Voucher.is_active == True,
        Voucher.valid_until > datetime.utcnow()
    ).all()
    return vouchers

@router.post('/', response_model=VoucherResponse)
async def create_voucher(
    voucher: VoucherCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new voucher (admin only)"""
    # For now, allow any authenticated user to create vouchers
    # In production, add admin role check

    db_voucher = Voucher(**voucher.dict())
    db.add(db_voucher)
    db.commit()
    db.refresh(db_voucher)
    return db_voucher

@router.post('/validate')
async def validate_voucher(
    request: VoucherValidationRequest,
    db: Session = Depends(get_db)
):
    """Validate a voucher code and return discount amount"""
    code = request.code.strip().upper()
    purchase_amount = request.purchase_amount
    voucher = db.query(Voucher).filter(
        Voucher.code == code,
        Voucher.is_active == True,
        Voucher.valid_until > datetime.utcnow()
    ).first()

    if not voucher:
        raise HTTPException(status_code=400, detail="Invalid or expired voucher code")

    if purchase_amount < voucher.min_purchase:
        raise HTTPException(
            status_code=400,
            detail=f"Minimum purchase amount is Rp {voucher.min_purchase:,}"
        )

    discount_amount = (purchase_amount * voucher.discount_percentage) // 100

    if voucher.max_discount and discount_amount > voucher.max_discount:
        discount_amount = voucher.max_discount

    return {
        "valid": True,
        "discount_percentage": voucher.discount_percentage,
        "discount_amount": discount_amount,
        "final_amount": purchase_amount - discount_amount
    }