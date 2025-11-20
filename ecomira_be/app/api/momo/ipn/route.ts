import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MOMO_SECRET_KEY = process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz';

function generateSignature(data: string): string {
  return crypto
    .createHmac('sha256', MOMO_SECRET_KEY)
    .update(data)
    .digest('hex');
}

// POST /api/payment/momo/ipn - MoMo IPN callback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('MoMo IPN received:', body);

    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = body;

    // Verify signature
    const rawSignature = `accessKey=${process.env.MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
    
    const expectedSignature = generateSignature(rawSignature);

    if (signature !== expectedSignature) {
      console.error('Invalid signature');
      return NextResponse.json(
        { resultCode: 97, message: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Update order payment status
    if (resultCode === 0) {
      // Payment successful
      await prisma.order.update({
        where: { orderNumber: orderId },
        data: {
          paymentStatus: 'COMPLETED',
        },
      });

      console.log(`Order ${orderId} payment completed`);
    } else {
      // Payment failed
      await prisma.order.update({
        where: { orderNumber: orderId },
        data: {
          paymentStatus: 'FAILED',
        },
      });

      console.log(`Order ${orderId} payment failed: ${message}`);
    }

    return NextResponse.json({
      resultCode: 0,
      message: 'Success',
    });
  } catch (error: any) {
    console.error('MoMo IPN error:', error);
    return NextResponse.json(
      { resultCode: 99, message: 'Internal error' },
      { status: 500 }
    );
  }
}