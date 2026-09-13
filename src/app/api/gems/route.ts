import { NextResponse } from 'next/server';

export async function GET() {
  const gems = [
    {
      name: 'Rialo',
      handle: 'RialoHQ',
      avatar: 'https://unavatar.io/x/RialoHQ',
      banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
      bio: 'The only high-throughput network with configurable privacy built for real-world finance. Subzero Labs.',
      followers: 48600,
      following: 112,
      joined: '2024-01-01',
      rialo_score: '100%',
      verified: true,
    },
    {
      name: 'yournahian.base.eth',
      handle: 'yournahian',
      avatar: 'https://pbs.twimg.com/profile_images/1966521996080209920/MbtcGvTv_400x400.jpg',
      banner: 'https://pbs.twimg.com/profile_banners/1860739181322063872/1751111404',
      bio: 'Web3 Builder & Researcher | Tracking high-throughput and configurable privacy on @RialoHQ.',
      followers: 2354,
      following: 1587,
      joined: '2024-11-24',
      rialo_score: '96.5%',
      verified: true,
    }
  ];

  return NextResponse.json({
    ok: true,
    projects: gems,
  });
}
