import { NextResponse } from 'next/server';

export async function GET() {
  const gems = [
    {
      name: 'Rialo',
      handle: 'RialoHQ',
      avatar: 'https://pbs.twimg.com/profile_images/1950265537784926208/qbjSWMDP_400x400.jpg',
      banner: 'https://pbs.twimg.com/profile_banners/1925569963009744897/1753814513',
      bio: 'The only high-throughput network with configurable privacy built for real-world finance. Backed by @PanteraCapital.',
      followers: 66356,
      following: 12,
      joined: '2025-05-22',
      rialo_score: '100%',
      verified: true,
    },
    {
      name: 'ade | rialo.io',
      handle: 'itachee_x',
      avatar: 'https://pbs.twimg.com/profile_images/2048930533871329280/7Rd1awxI_400x400.jpg',
      banner: 'https://pbs.twimg.com/profile_banners/1334066368069521408/1777338355',
      bio: 'Co-founder/CEO @subzero_labs, building @rialohq & rialo.io. Prev engineering @mysten_labs (@suinetwork), @netflix, @amd',
      followers: 6970,
      following: 1427,
      joined: '2020-12-02',
      rialo_score: '99.2%',
      verified: true,
    },
    {
      name: 'Subzero Labs',
      handle: 'Subzero_Labs',
      avatar: 'https://pbs.twimg.com/profile_images/1940669305718247424/M9Cp4K9G_400x400.jpg',
      banner: 'https://pbs.twimg.com/profile_banners/1875755025311657984/1754089254',
      bio: 'Building @RialoHQ. Backed by @PanteraCapital',
      followers: 9699,
      following: 5,
      joined: '2025-01-05',
      rialo_score: '98.7%',
      verified: true,
    },
  ];

  return NextResponse.json({
    ok: true,
    projects: gems,
  });
}
