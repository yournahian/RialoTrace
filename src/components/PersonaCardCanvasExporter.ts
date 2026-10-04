"use client";

export interface PersonaCardData {
  handle: string;
  title: string;
  rarity: 'MYTHIC' | 'LEGENDARY' | 'EPIC' | 'RARE' | 'COMMON';
  finalitySpeed: string;
  frictionRate: string;
  imageUrl: string;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      const fb = new Image();
      fb.crossOrigin = 'anonymous';
      fb.onload = () => resolve(fb);
      fb.onerror = () => resolve(null);
      fb.src = `https://ui-avatars.com/api/?name=User&background=0A0D0C&color=E5C365&size=400&bold=true`;
    };
    img.src = src;
  });
}

function getRarityTheme(rarity: PersonaCardData['rarity']) {
  switch (rarity) {
    case 'MYTHIC':
      return { color: '#FF85E1', glow: 'rgba(255,133,225,0.45)', stars: 5 };
    case 'LEGENDARY':
      return { color: '#F59E0B', glow: 'rgba(245,158,11,0.45)', stars: 4 };
    case 'EPIC':
      return { color: '#A855F7', glow: 'rgba(168,85,247,0.45)', stars: 3 };
    case 'RARE':
      return { color: '#A9DDD3', glow: 'rgba(169,221,211,0.45)', stars: 2 };
    default:
      return { color: '#94A3B8', glow: 'rgba(148,163,184,0.35)', stars: 1 };
  }
}

export async function exportPersonaCardPNG(data: PersonaCardData): Promise<Blob | null> {
  // Ultra-crisp HD export: 700x1000 dimensions (2x scale for 350x500 design)
  const width = 700;
  const height = 1000;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const theme = getRarityTheme(data.rarity);
  const cardR = 44;

  // Clip rounded card boundaries
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(0, 0, width, height, cardR);
  ctx.clip();

  // 1. Dark Void Background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#0F1614');
  bgGrad.addColorStop(0.35, '#0B100E');
  bgGrad.addColorStop(1, '#050807');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Top-left Theme Glow
  const radial = ctx.createRadialGradient(0, 0, 10, 0, 0, 450);
  radial.addColorStop(0, `${theme.color}35`);
  radial.addColorStop(1, 'transparent');
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, width, height);

  // Diagonal mesh lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
  ctx.lineWidth = 1;
  for (let i = -width; i < width * 2; i += 28) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + height, height);
    ctx.stroke();
  }

  // 2. HERO IMAGE AREA (Center area between left 88px and right 72px)
  const leftBarW = 88;
  const rightBarW = 72;
  const topBarH = 80;
  const heroW = width - leftBarW - rightBarW;
  const heroH = height - topBarH - 380; // height: 540

  let img: HTMLImageElement | null = null;
  if (data.imageUrl) {
    try {
      img = await loadImage(data.imageUrl);
    } catch {
      img = null;
    }
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(leftBarW, topBarH, heroW, heroH);
  ctx.clip();

  if (img) {
    // Cover fit
    const imgAspect = img.width / img.height;
    const heroAspect = heroW / heroH;
    let drawW, drawH, drawX, drawY;

    if (imgAspect > heroAspect) {
      drawH = heroH;
      drawW = heroH * imgAspect;
      drawX = leftBarW + (heroW - drawW) / 2;
      drawY = topBarH;
    } else {
      drawW = heroW;
      drawH = heroW / imgAspect;
      drawX = leftBarW;
      drawY = topBarH + (heroH - drawH) / 2;
    }
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  } else {
    // Stylized placeholder avatar
    ctx.fillStyle = '#0E1714';
    ctx.fillRect(leftBarW, topBarH, heroW, heroH);
    ctx.fillStyle = theme.color;
    ctx.font = '900 120px "Bebas Neue", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(data.handle.slice(0, 2).toUpperCase(), leftBarW + heroW / 2, topBarH + heroH / 2);
  }

  // Smooth bottom vignette / fade into info card
  const fade = ctx.createLinearGradient(0, topBarH + heroH - 160, 0, topBarH + heroH);
  fade.addColorStop(0, 'rgba(7, 10, 9, 0)');
  fade.addColorStop(1, 'rgba(7, 10, 9, 0.96)');
  ctx.fillStyle = fade;
  ctx.fillRect(leftBarW, topBarH + heroH - 160, heroW, 160);
  ctx.restore();

  // 3. CURSIVE SIGNATURE OVERLAY
  ctx.save();
  ctx.translate(leftBarW + heroW / 2, topBarH + 90);
  ctx.rotate((-7 * Math.PI) / 180);
  ctx.font = '700 52px "Caveat", "Dancing Script", cursive, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 4;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`@${data.handle}`, 0, 0);
  ctx.restore();

  // 4. LEFT VERTICAL "RIALO" BAR
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, leftBarW, height);
  ctx.strokeStyle = `${theme.color}35`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(leftBarW, 0);
  ctx.lineTo(leftBarW, height);
  ctx.stroke();

  ctx.save();
  ctx.translate(leftBarW / 2, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.font = '900 72px "Bebas Neue", "Impact", "Arial Black", sans-serif';
  ctx.fillStyle = theme.color;
  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = 30;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '6px';
  ctx.font = '900 56px "Bebas Neue", "Impact", "Arial Black", sans-serif';
  ctx.fillText('RIALO TRACE', 0, 0);
  ctx.restore();

  // 5. RIGHT VERTICAL TAG BAR
  ctx.fillStyle = `${theme.color}15`;
  ctx.fillRect(width - rightBarW, 0, rightBarW, height);
  ctx.strokeStyle = `${theme.color}35`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width - rightBarW, 0);
  ctx.lineTo(width - rightBarW, height);
  ctx.stroke();

  ctx.save();
  ctx.translate(width - rightBarW / 2, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.font = '700 15px "Space Mono", monospace';
  ctx.fillStyle = `${theme.color}DD`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '3px';
  ctx.fillText('OCT 2026 • RIALO.IO', 0, 0);
  ctx.restore();

  // 6. TOP HEADER BAR
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.fillRect(leftBarW, 0, heroW, topBarH);
  ctx.strokeStyle = `${theme.color}35`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(leftBarW, topBarH);
  ctx.lineTo(width - rightBarW, topBarH);
  ctx.stroke();

  ctx.font = '700 16px "Space Mono", monospace';
  ctx.fillStyle = 'rgba(229, 195, 101, 0.85)';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '4px';
  ctx.fillText('SPECIMEN // 2026 EDITION', leftBarW + 24, topBarH / 2);

  ctx.font = '800 16px "Space Mono", monospace';
  ctx.fillStyle = theme.color;
  ctx.textAlign = 'right';
  ctx.letterSpacing = '2px';
  ctx.fillText(data.rarity, width - rightBarW - 24, topBarH / 2);

  // 7. HAZARD STRIPES ACCENT
  const hazardY = height - 190;
  const hazardH = 44;
  ctx.save();
  ctx.beginPath();
  ctx.rect(leftBarW, hazardY, heroW, hazardH);
  ctx.clip();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(leftBarW, hazardY, heroW, hazardH);

  ctx.strokeStyle = 'rgba(229, 195, 101, 0.2)';
  ctx.lineWidth = 10;
  for (let x = leftBarW - hazardH; x < width - rightBarW + hazardH; x += 22) {
    ctx.beginPath();
    ctx.moveTo(x, hazardY + hazardH);
    ctx.lineTo(x + hazardH, hazardY);
    ctx.stroke();
  }
  ctx.restore();

  // 8. BOTTOM INFO BLOCK
  const infoY = height - 380;
  const infoH = 190;
  ctx.fillStyle = 'rgba(7, 10, 9, 0.88)';
  ctx.fillRect(leftBarW, infoY, heroW, infoH);

  // Title
  ctx.font = '900 48px "Bebas Neue", "Impact", "Arial Black", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = 20;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(data.title.toUpperCase(), leftBarW + 28, infoY + 22);
  ctx.shadowBlur = 0;

  // Stats line
  ctx.font = '700 17px "Space Mono", monospace';
  ctx.fillStyle = theme.color;
  ctx.letterSpacing = '2px';
  ctx.fillText(
    `${data.finalitySpeed}  •  FRICTION ${data.frictionRate}`.toUpperCase(),
    leftBarW + 28,
    infoY + 84
  );

  // Stars
  ctx.font = '700 24px sans-serif';
  let starX = leftBarW + 28;
  for (let s = 0; s < 5; s++) {
    if (s < theme.stars) {
      ctx.fillStyle = '#F59E0B';
      ctx.shadowColor = 'rgba(245, 158, 11, 0.8)';
      ctx.shadowBlur = 10;
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.shadowBlur = 0;
    }
    ctx.fillText('★', starX, infoY + 120);
    starX += 26;
  }
  ctx.shadowBlur = 0;

  // 9. FOOTER BAR
  const footerY = height - 100;
  const footerH = 100;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.fillRect(leftBarW, footerY, heroW, footerH);
  ctx.strokeStyle = `${theme.color}35`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(leftBarW, footerY);
  ctx.lineTo(width - rightBarW, footerY);
  ctx.stroke();

  ctx.font = '700 14px "Space Mono", monospace';
  ctx.fillStyle = 'rgba(229, 195, 101, 0.65)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '3px';
  ctx.fillText('WWW.RIALO.IO • ZERO-FRICTION PROTOCOL', leftBarW + heroW / 2, footerY + footerH / 2);

  // 10. Outer Bevel & Glow Border
  ctx.restore(); // remove clip
  ctx.strokeStyle = theme.color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(2, 2, width - 4, height - 4, cardR);
  ctx.stroke();

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png', 1.0);
  });
}
