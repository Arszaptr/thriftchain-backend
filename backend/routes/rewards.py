from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import User, Cashout

router = APIRouter(prefix='/rewards', tags=['rewards'])


def get_tier(tokens: float):
    if tokens >= 2001:
        return 'Diamond'
    if tokens >= 501:
        return 'Gold'
    if tokens >= 101:
        return 'Silver'
    return 'Bronze'


def get_fee_ratio(tier: str):
    if tier == 'Diamond':
        return 0.0
    if tier == 'Gold':
        return 0.005
    if tier == 'Silver':
        return 0.01
    return 0.02


class CashoutRequest(BaseModel):
    user_id: int
    tokens_used: float
    method: str
    account: str


@router.post('/cashout')
def cashout(payload: CashoutRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail='User tidak ditemukan')
    if payload.tokens_used < 100:
        raise HTTPException(status_code=400, detail='Minimal cashout 100 token')
    if payload.tokens_used > user.thrift_tokens:
        raise HTTPException(status_code=400, detail='Token tidak mencukupi')

    tier = get_tier(user.thrift_tokens)
    amount_rp = int((payload.tokens_used / 100) * 5000)
    fee_ratio = get_fee_ratio(tier)
    fee = int(amount_rp * fee_ratio)
    final_amount = amount_rp - fee
    ref_number = f'TC-{user.id}{int(user.thrift_tokens)}{len(user.username)}'

    cashout = Cashout(
        user_id=user.id,
        tokens_used=payload.tokens_used,
        amount_rp=final_amount,
        method=payload.method,
        account=payload.account,
        status='success',
        ref_number=ref_number,
    )
    user.thrift_tokens -= payload.tokens_used
    user.tier = get_tier(user.thrift_tokens)
    db.add(cashout)
    db.commit()

    return {'status': 'success', 'amount_rp': final_amount, 'ref_number': ref_number, 'tier': user.tier}


@router.get('/tiers')
def get_tiers():
    return [
        {'tier': 'Bronze', 'range': '0-100', 'benefit': 'Akses marketplace'},
        {'tier': 'Silver', 'range': '101-500', 'benefit': 'Diskon 5% + prioritas listing'},
        {'tier': 'Gold', 'range': '501-2000', 'benefit': 'Diskon 15% + cashout express'},
        {'tier': 'Diamond', 'range': '2001+', 'benefit': 'Diskon 25% + fee cashout 0% + badge eksklusif'},
    ]
