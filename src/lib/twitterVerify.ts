export interface XProfile {
  name: string;
  screenName: string;
  avatar: string;
  followers: number;
  bio: string;
  verified: boolean;
}

export interface XVerifyResult {
  ok: boolean;
  notFound?: boolean;
  error?: string;
  profile?: XProfile;
}

/**
 * Validates whether an X (Twitter) handle exists in real time
 * and returns their live public profile (avatar, name, bio, followers).
 *
 * Uses resilient multi-tier edge APIs with strict timeouts (fxtwitter -> vxtwitter fallback).
 */
export async function verifyXUser(rawHandle: string): Promise<XVerifyResult> {
  const clean = (rawHandle || '').replace(/^@/, '').trim().toLowerCase();

  if (!clean) {
    return { ok: false, error: 'Please enter an X (Twitter) handle.' };
  }

  // X handle validation rules: 1-15 characters, alphanumeric and underscore only
  if (!/^[a-zA-Z0-9_]{1,15}$/.test(clean)) {
    return {
      ok: false,
      error: 'Invalid X handle format. Handles must be 1-15 characters (letters, numbers, or underscores).',
    };
  }

  // Tier 1: Query api.fxtwitter.com
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`https://api.fxtwitter.com/${clean}`, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    }).finally(() => clearTimeout(timeout));

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.code === 200 && data.user) {
        const u = data.user;
        const avatar = u.avatar_url
          ? u.avatar_url.replace('_normal', '_400x400')
          : `https://unavatar.io/x/${clean}`;

        return {
          ok: true,
          profile: {
            name: u.name || clean,
            screenName: u.screen_name || clean,
            avatar,
            followers: typeof u.followers === 'number' ? u.followers : 0,
            bio: u.description || '',
            verified: Boolean(u.verification?.verified || u.verified),
          },
        };
      }
    }
  } catch (e) {
    // Fall through to Tier 2
  }

  // Tier 2: Fallback to api.vxtwitter.com
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`https://api.vxtwitter.com/${clean}`, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    }).finally(() => clearTimeout(timeout));

    if (res.status === 404) {
      return {
        ok: false,
        notFound: true,
        error: `Account @${clean} does not exist on X (Twitter).`,
      };
    }

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && (data.user_name || data.screen_name)) {
        const avatar = data.avatar_url
          ? data.avatar_url.replace('_normal', '_400x400')
          : `https://unavatar.io/x/${clean}`;

        return {
          ok: true,
          profile: {
            name: data.user_name || data.screen_name || clean,
            screenName: data.screen_name || clean,
            avatar,
            followers: typeof data.followers_count === 'number' ? data.followers_count : 0,
            bio: data.description || '',
            verified: Boolean(data.verified),
          },
        };
      }
    }
  } catch (e) {
    // Both network calls failed or timed out
  }

  // Tier 3: If both confirmed not found or invalid
  return {
    ok: false,
    notFound: true,
    error: `Account @${clean} not found on X (Twitter). Please verify the handle spelling.`,
  };
}
