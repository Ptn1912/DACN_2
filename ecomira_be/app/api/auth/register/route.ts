// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { PrismaClient, Prisma } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, phone, password, userType } = body;

    // Validate input
    if (!fullName || !email || !password || !userType) {
      return NextResponse.json(
        { error: 'Vui lòng điền đầy đủ thông tin' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email không hợp lệ' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Mật khẩu phải có ít nhất 8 ký tự' },
        { status: 400 }
      );
    }

    // Validate userType
    if (!['customer', 'seller'].includes(userType)) {
      return NextResponse.json(
        { error: 'Loại tài khoản không hợp lệ' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user with Prisma
    const user = await prisma.user.create({
      data: {
        fullName,
        email: email.toLowerCase(),
        phone: phone || null,
        passwordHash,
        userType: userType as 'customer' | 'seller',
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        userType: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Đăng ký thành công',
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          userType: user.userType,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
  console.error('Register error:', error);

  // Type guard for Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email đã được sử dụng' },
        { status: 409 }
      );
    }
  }

  return NextResponse.json(
    { error: 'Đăng ký thất bại' },
    { status: 500 }
  );
}
}