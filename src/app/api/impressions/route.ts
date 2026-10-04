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

const RIALO_PROJECTS = ['RialoHQ', 'latch', 'agp'];

// In-memory cache to guarantee instant responses and prevent repeated slow queries
interface CacheEntry {
  timestamp: number;
  data: any;
}
const MEMORY_CACHE = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('handle') || searchParams.get('username');
  const project = searchParams.get('project');
  if (!username) {
    return NextResponse.json({ ok: false, error: 'Username or handle parameter required' }, { status: 400 });
  }
  return handleImpressions(username, project || undefined);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawUsername = body.username?.trim() || body.handle?.trim();
    const project = body.project?.trim();

    if (!rawUsername) {
      return NextResponse.json({ ok: false, error: 'Username is required' }, { status: 400 });
    }

    return handleImpressions(rawUsername, project || undefined);
  } catch (error) {
    console.error('Impressions API route error:', error);
    return NextResponse.json({ ok: false, error: 'Failed to calculate impressions' }, { status: 500 });
  }
}

async function handleImpressions(rawUsername: string, targetProject?: string) {
  try {
    const cleanUsername = rawUsername.replace(/^@/, '').trim().toLowerCase();
    const cacheKey = `${cleanUsername}:${targetProject || 'all'}`;

    // 0. Check in-memory cache
    const cached = MEMORY_CACHE.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(cached.data);
    }

    const projectsToQuery = targetProject && targetProject !== 'all' ? [targetProject] : RIALO_PROJECTS;

    // 1. Fetch live real data across Rialo Ecosystem (RialoHQ, latch, agp)
    // High timeout (18s) because heavy accounts with 250+ posts on Xerper take 9-12s
    try {
      const results = await Promise.all(
        projectsToQuery.map(async (prj) => {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 18000);
            const xerperRes = await fetch('https://www.xerper.com/api/impressions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              },
              body: JSON.stringify({
                username: cleanUsername,
                project: prj,
              }),
              signal: controller.signal,
            }).finally(() => clearTimeout(timeoutId));

            if (xerperRes.ok) {
              const data = await xerperRes.json();
              return { project: prj, data };
            }
          } catch (e) {
            console.warn(`Xerper query error for ${prj}:`, e);
          }
          return { project: prj, data: null };
        })
      );

      let totalImpressions = 0;
      let totalPosts = 0;
      let bestProfile: any = null;
      const allPosts: any[] = [];
      const breakdown: Record<string, { impressions: number; posts: number }> = {};
      let hasValidData = false;

      for (const res of results) {
        const d = res.data;
        if (d && (d.ok || typeof d.total_impressions === 'number')) {
          hasValidData = true;
          const imps = typeof d.total_impressions === 'number' ? d.total_impressions : 0;
          const postsCount = typeof d.post_count === 'number' ? d.post_count : 0;
          totalImpressions += imps;
          totalPosts += postsCount;
          breakdown[res.project] = { impressions: imps, posts: postsCount };

          if (!bestProfile && d.profile?.avatar) {
            bestProfile = d.profile;
          } else if (d.profile?.avatar && !d.profile.avatar.includes('unavatar')) {
            bestProfile = d.profile;
          }

          if (Array.isArray(d.posts)) {
            allPosts.push(...d.posts);
          }
        }
      }

      if (hasValidData) {
        // Deduplicate posts
        const seen = new Set<string>();
        const dedupedPosts = allPosts.filter((p) => {
          const key = p.id || p.tweet_id || p.url || p.text;
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        const rawAvatar = bestProfile?.avatar?.replace('_normal', '_400x400');
        const responseData = {
          ok: true,
          username: cleanUsername,
          project: targetProject || 'Rialo Ecosystem (RialoHQ, Latch, AGP)',
          profile: {
            name: bestProfile?.name || cleanUsername,
            screen_name: bestProfile?.screen_name || cleanUsername,
            avatar: rawAvatar || `https://unavatar.io/x/${cleanUsername}`,
            banner: bestProfile?.banner || null,
            bio: bestProfile?.bio || '',
            followers: bestProfile?.followers || 0,
            following: bestProfile?.following || 0,
            verified: Boolean(bestProfile?.verified),
            joined: bestProfile?.joined || '',
          },
          project_profile: {
            name: 'rialo.io',
            handle: 'RialoHQ',
            avatar: null,
          },
          total_impressions: totalImpressions,
          post_count: totalPosts,
          breakdown,
          series: results.find((r) => r.data?.series?.length)?.data.series || [],
          posts: dedupedPosts,
        };

        // Cache the response
        MEMORY_CACHE.set(cacheKey, { timestamp: Date.now(), data: responseData });

        return NextResponse.json(responseData);
      }
    } catch (err) {
      console.warn('Live ecosystem proxy fetch failed, trying direct X API / fallback:', err);
    }

    // 2. Second priority: If bearer token is provided, query official X API v2
    const bearerToken = process.env.X_API_BEARER_TOKEN;
    let profile = {
      name: cleanUsername,
      screen_name: cleanUsername,
      avatar: `https://unavatar.io/x/${cleanUsername}`,
      banner: null as string | null,
      bio: '',
      followers: 1200,
      following: 800,
      verified: false,
      joined: '',
    };

    if (bearerToken) {
      try {
        const xRes = await fetch(
          `https://api.twitter.com/2/users/by/username/${cleanUsername}?user.fields=name,username,profile_image_url,verified,public_metrics,description,created_at`,
          {
            headers: {
              Authorization: `Bearer ${bearerToken}`,
            },
            next: { revalidate: 120 },
          }
        );

        if (xRes.ok) {
          const xData: TwitterUserResponse = await xRes.json();
          if (xData.data) {
            profile = {
              name: xData.data.name,
              screen_name: xData.data.username,
              avatar: xData.data.profile_image_url
                ? xData.data.profile_image_url.replace('_normal', '_400x400')
                : `https://unavatar.io/x/${cleanUsername}`,
              banner: null,
              bio: xData.data.description || '',
              followers: xData.data.public_metrics?.followers_count || 1200,
              following: xData.data.public_metrics?.following_count || 800,
              verified: Boolean(xData.data.verified),
              joined: (xData.data as any).created_at || '',
            };
          }
        }
      } catch (err) {
        console.warn('X API request error, using fallback:', err);
      }
    }

    // 3. Fallback when user has 0 posts across Rialo, Latch, AGP
    return NextResponse.json({
      ok: true,
      username: cleanUsername,
      project: targetProject || 'Rialo Ecosystem',
      profile,
      project_profile: {
        name: 'rialo.io',
        handle: 'RialoHQ',
        avatar: null,
      },
      total_impressions: 0,
      post_count: 0,
      breakdown: { RialoHQ: { impressions: 0, posts: 0 }, latch: { impressions: 0, posts: 0 }, agp: { impressions: 0, posts: 0 } },
      series: [],
      posts: [],
    });
  } catch (error) {
    console.error('Impressions API route error:', error);
    return NextResponse.json({ ok: false, error: 'Failed to calculate impressions' }, { status: 500 });
  }
}
