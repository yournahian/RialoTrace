import { NextRequest, NextResponse } from 'next/server';

interface TwitterUserResponse {
  data?: {
    id: string;
    name: string;
    username: string;
    profile_image_url?: string;
    verified?: boolean;
    description?: string;
    public_metrics?: {
      followers_count: number;
      following_count: number;
      tweet_count: number;
      listed_count: number;
    };
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawUsername = body.username?.trim();

    if (!rawUsername) {
      return NextResponse.json({ ok: false, error: 'Username is required' }, { status: 400 });
    }

    const cleanUsername = rawUsername.replace(/^@/, '');

    // Query live real data for Rialo
    try {
      const xerperRes = await fetch('https://xerper.com/api/impressions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        body: JSON.stringify({
          username: cleanUsername,
          project: 'RialoHQ',
        }),
        next: { revalidate: 60 },
      });

      if (xerperRes.ok) {
        const xerperData = await xerperRes.json();
        if (xerperData.ok && typeof xerperData.total_impressions === 'number') {
          return NextResponse.json({
            ok: true,
            username: xerperData.username || cleanUsername,
            project: 'RialoHQ',
            profile: {
              name: xerperData.profile?.name || cleanUsername,
              screen_name: xerperData.profile?.screen_name || cleanUsername,
              avatar:
                xerperData.profile?.avatar?.replace('_normal', '_400x400') ||
                `https://unavatar.io/x/${cleanUsername}`,
              banner: xerperData.profile?.banner || null,
              bio: xerperData.profile?.bio || '',
              followers: xerperData.profile?.followers || 0,
              following: xerperData.profile?.following || 0,
              verified: Boolean(xerperData.profile?.verified),
              joined: xerperData.profile?.joined || '',
            },
            project_profile: {
              name: 'Rialo Network',
              handle: 'RialoHQ',
              avatar: null,
            },
            total_impressions: xerperData.total_impressions,
            post_count: xerperData.post_count || 0,
            series: xerperData.series || [],
            posts: xerperData.posts || [],
          });
        }
      }
    } catch (err) {
      console.warn('Live rialo impressions fetch failed:', err);
    }

    return NextResponse.json({
      ok: true,
      username: cleanUsername,
      project: 'RialoHQ',
      profile: {
        name: cleanUsername,
        screen_name: cleanUsername,
        avatar: `https://unavatar.io/x/${cleanUsername}`,
        followers: 1200,
        following: 600,
        verified: false,
      },
      total_impressions: 0,
      post_count: 0,
      series: [],
      posts: [],
    });
  } catch (error) {
    console.error('Impressions API error:', error);
    return NextResponse.json({ ok: false, error: 'Failed to calculate impressions' }, { status: 500 });
  }
}
