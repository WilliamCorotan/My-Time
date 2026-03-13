import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateApiToken, getUserApiTokens, revokeApiToken } from '@/lib/api-tokens';

// GET - List all tokens for current user
export async function GET() {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const tokens = await getUserApiTokens(userId, orgId);
    // Don't send the full token value, only metadata
    const sanitizedTokens = tokens.map(({ token, ...rest }) => ({
      ...rest,
      tokenPreview: `${token.substring(0, 10)}...${token.substring(token.length - 4)}`,
    }));

    return NextResponse.json({ tokens: sanitizedTokens });
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return NextResponse.json({ error: 'Failed to fetch tokens' }, { status: 500 });
  }
}

// POST - Generate a new token
export async function POST(req: NextRequest) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, expiresInDays } = body;

    if (!name || typeof name !== 'string' || name.trim() === '' || name.trim().length > 100) {
      return NextResponse.json({ error: 'Token name is required and must be 100 characters or less' }, { status: 400 });
    }

    if (expiresInDays !== undefined) {
      const days = Number(expiresInDays);
      if (!Number.isInteger(days) || days < 1 || days > 365) {
        return NextResponse.json({ error: 'expiresInDays must be an integer between 1 and 365' }, { status: 400 });
      }
    }

    const token = await generateApiToken(userId, orgId, name.trim(), expiresInDays);

    return NextResponse.json({
      success: true,
      token,
      message: 'Token generated successfully. Make sure to copy it now - you won\'t be able to see it again!',
    });
  } catch (error) {
    console.error('Error generating token:', error);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}

// DELETE - Revoke a token
export async function DELETE(req: NextRequest) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const tokenId = searchParams.get('id');

    if (!tokenId || isNaN(parseInt(tokenId))) {
      return NextResponse.json({ error: 'A valid token ID is required' }, { status: 400 });
    }

    const revoked = await revokeApiToken(parseInt(tokenId), userId, orgId);
    if (!revoked) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Token revoked successfully',
    });
  } catch (error) {
    console.error('Error revoking token:', error);
    return NextResponse.json({ error: 'Failed to revoke token' }, { status: 500 });
  }
}
