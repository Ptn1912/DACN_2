// app/api/products/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/products/search - Advanced search with autocomplete
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query');
    const type = searchParams.get('type') || 'full'; // full, autocomplete, suggestions
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        results: [],
        suggestions: [],
        message: 'Query too short',
      });
    }

    const searchTerm = query.trim();

    // Autocomplete: Quick search for suggestions
    if (type === 'autocomplete') {
      const suggestions = await prisma.product.findMany({
        where: {
          isActive: true,
          name: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
          name: true,
          price: true,
          images: true,
          category: {
            select: {
              name: true,
            },
          },
        },
        take: limit,
        orderBy: {
          soldCount: 'desc',
        },
      });

      return NextResponse.json({
        suggestions,
        query: searchTerm,
      });
    }

    // Full search: Comprehensive results
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        ],
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
        seller: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: [
        { soldCount: 'desc' },
        { rating: 'desc' },
      ],
      take: limit,
    });

    // Get related categories
    const categoryIds = [...new Set(products.map(p => p.categoryId))];
    const categories = await prisma.category.findMany({
      where: {
        id: {
          in: categoryIds,
        },
      },
      select: {
        id: true,
        name: true,
        icon: true,
        color: true,
      },
    });

    return NextResponse.json({
      results: products,
      categories,
      query: searchTerm,
      total: products.length,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}

// POST /api/products/search/history - Save search history
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, query } = body;

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Invalid query' },
        { status: 400 }
      );
    }

    // Here you can save to a SearchHistory table if you want
    // For now, we'll just return success
    return NextResponse.json({
      success: true,
      query: query.trim(),
    });
  } catch (error) {
    console.error('Save search history error:', error);
    return NextResponse.json(
      { error: 'Failed to save search history' },
      { status: 500 }
    );
  }
}