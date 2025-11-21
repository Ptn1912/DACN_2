import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// MoMo Configuration
const MOMO_CONFIG = {
  partnerCode: process.env.MOMO_PARTNER_CODE || 'MOMO',
  accessKey: process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85',
  secretKey: process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
  endpoint: process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create',
  redirectUrl: 'ecommerceapp://pending',
  ipnUrl: ""
};

// Generate MoMo signature
function generateSignature(data: string): string {
  return crypto
    .createHmac('sha256', MOMO_CONFIG.secretKey)
    .update(data)
    .digest('hex');
}

// POST /api/payment/momo - Create MoMo payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, amount, orderInfo } = body;

    if (!orderId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { orderNumber: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const requestId = `${orderId}_${Date.now()}`;
    const orderIdMomo = orderId;
    const requestType = 'captureWallet';
    const extraData = '';

    // Create signature
    const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${MOMO_CONFIG.ipnUrl}&orderId=${orderIdMomo}&orderInfo=${orderInfo}&partnerCode=${MOMO_CONFIG.partnerCode}&redirectUrl=${MOMO_CONFIG.redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    
    const signature = generateSignature(rawSignature);

    const requestBody = {
      partnerCode: MOMO_CONFIG.partnerCode,
      accessKey: MOMO_CONFIG.accessKey,
      requestId,
      amount: amount.toString(),
      orderId: orderIdMomo,
      orderInfo,
      redirectUrl: MOMO_CONFIG.redirectUrl,
      ipnUrl: MOMO_CONFIG.ipnUrl,
      extraData,
      requestType,
      signature,
      lang: 'vi',
    };

    console.log('MoMo Request:', requestBody);

    // Call MoMo API
    const momoResponse = await axios.post(MOMO_CONFIG.endpoint, requestBody, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('MoMo Response:', momoResponse.data);

    if (momoResponse.data.resultCode === 0) {
      return NextResponse.json({
        success: true,
        payUrl: momoResponse.data.payUrl,
        requestId,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: momoResponse.data.message || 'MoMo payment failed',
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('MoMo payment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create MoMo payment' },
      { status: 500 }
    );
  }
}