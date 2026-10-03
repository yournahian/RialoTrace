"use client";

export interface RialoCardExportData {
  handle?: string;
  name?: string;
  avatar?: string;
  cardImage?: string;
  archetypeId: string;
  archetypeTitle: string;
  archetypeLore: string;
  rarity: string;
  badgeEmoji?: string;
  impressions?: number;
  wave?: string;
  glowColor: string;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function exportRialoCardPNG(data: RialoCardExportData): Promise<Blob | null> {
  // Proportions matching the website card exactly
  const width = 440;
  const height = 690;
  const scale = 2; // 2x backing canvas for ultra-sharp Retina output

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.scale(scale, scale);

  // Pre-load the card artwork image if provided
  let artImg: HTMLImageElement | null = null;
  if (data.cardImage) {
    artImg = await loadImage(data.cardImage);
  }

  const glowColor = data.glowColor || '#A855F7';
  const rarityText = (data.rarity || 'RARE').toUpperCase();
  const badgeEmoji = data.badgeEmoji || '⚡';

  // Card Outer Dimensions
  const cardX = 0;
  const cardY = 0;
  const cardW = width;
  const cardH = height;
  const cardR = 32;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, cardR);
  ctx.clip();

  // 1. Crisp Silvery-White Gradient Card Surface (Matches .monad-card-front)
  const surface = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
  surface.addColorStop(0, '#FFFFFF');
  surface.addColorStop(0.6, '#F8FAFC');
  surface.addColorStop(1, '#F1F5F9');
  ctx.fillStyle = surface;
  ctx.fillRect(cardX, cardY, cardW, cardH);

  // Subtle Outer Border
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.12)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 2. Top Nameplate Bar (.monad-card-nameplate)
  const pad = 20;
  const nbX = cardX + pad;
  const nbY = cardY + pad;
  const nbW = cardW - pad * 2;
  const nbH = 46;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.04)';
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.08)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(nbX, nbY, nbW, nbH, 12);
  ctx.fill();
  ctx.stroke();

  // Left Title: "Rialo." with mint green dot, then "• WAVE 1 • GENESIS"
  ctx.font = '800 15px "Space Grotesk", -apple-system, sans-serif';
  ctx.fillStyle = '#0F172A';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText('Rialo', nbX + 16, nbY + nbH / 2);

  const rialoWidth = ctx.measureText('Rialo').width;
  // Mint dot
  ctx.fillStyle = '#10B981';
  ctx.beginPath();
  ctx.arc(nbX + 16 + rialoWidth + 3, nbY + nbH / 2 + 1, 3, 0, Math.PI * 2);
  ctx.fill();

  // Text "• WAVE 1 • GENESIS"
  ctx.font = '800 12px "Space Mono", "Courier New", monospace';
  ctx.fillStyle = '#0F172A';
  ctx.fillText('  WAVE 1 • GENESIS', nbX + 16 + rialoWidth + 8, nbY + nbH / 2);

  // Right: Top Rarity Badge Pill
  const pillH = 26;
  ctx.font = '800 11px "Space Grotesk", sans-serif';
  const pillText = `${badgeEmoji} ${rarityText}`;
  const pillTextWidth = ctx.measureText(pillText).width;
  const pillW = pillTextWidth + 20;
  const pillX = nbX + nbW - pillW - 10;
  const pillY = nbY + (nbH - pillH) / 2;

  ctx.fillStyle = `${glowColor}20`;
  ctx.strokeStyle = glowColor;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, 9999);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = glowColor;
  ctx.textAlign = 'center';
  ctx.fillText(pillText, pillX + pillW / 2, pillY + pillH / 2);

  // 3. Character Artwork Frame (.monad-art-frame)
  const artX = cardX + pad;
  const artY = nbY + nbH + 12;
  const artW = cardW - pad * 2;
  const artH = 345;
  const artR = 18;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(artX, artY, artW, artH, artR);
  ctx.clip();

  // Frame Background
  ctx.fillStyle = '#070A10';
  ctx.fillRect(artX, artY, artW, artH);

  if (artImg && artImg.naturalWidth > 0) {
    // Fill and crop image centered
    const imgAspect = artImg.naturalWidth / artImg.naturalHeight;
    const frameAspect = artW / artH;
    let drawW = artW;
    let drawH = artH;
    let drawX = artX;
    let drawY = artY;

    if (imgAspect > frameAspect) {
      drawW = artH * imgAspect;
      drawX = artX - (drawW - artW) / 2;
    } else {
      drawH = artW / imgAspect;
      drawY = artY - (drawH - artH) / 2;
    }
    ctx.drawImage(artImg, drawX, drawY, drawW, drawH);
  }

  // Tech HUD Box in Top-Left Corner of Artwork
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.strokeStyle = `${glowColor}90`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(artX + 12, artY + 12, 175, 26, 4);
  ctx.fill();
  ctx.stroke();

  ctx.font = '800 9.5px "Space Mono", monospace';
  ctx.fillStyle = glowColor;
  ctx.textAlign = 'left';
  ctx.fillText(data.archetypeTitle.toUpperCase(), artX + 18, artY + 23);

  ctx.font = '600 7px "Space Mono", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.fillText('DECENTRALIZED RESILIENCE // PROTOCOL ARTIFACT', artX + 18, artY + 32);

  // Tech Corner Brackets on the 4 corners of the Artwork Frame
  const bracketSize = 14;
  ctx.strokeStyle = glowColor;
  ctx.lineWidth = 2;

  // Top-Left Bracket
  ctx.beginPath();
  ctx.moveTo(artX + 10, artY + 10 + bracketSize);
  ctx.lineTo(artX + 10, artY + 10);
  ctx.lineTo(artX + 10 + bracketSize, artY + 10);
  ctx.stroke();

  // Top-Right Bracket
  ctx.beginPath();
  ctx.moveTo(artX + artW - 10 - bracketSize, artY + 10);
  ctx.lineTo(artX + artW - 10, artY + 10);
  ctx.lineTo(artX + artW - 10, artY + 10 + bracketSize);
  ctx.stroke();

  // Bottom-Left Bracket
  ctx.beginPath();
  ctx.moveTo(artX + 10, artY + artH - 10 - bracketSize);
  ctx.lineTo(artX + 10, artY + artH - 10);
  ctx.lineTo(artX + 10 + bracketSize, artY + artH - 10);
  ctx.stroke();

  // Bottom-Right Bracket
  ctx.beginPath();
  ctx.moveTo(artX + artW - 10 - bracketSize, artY + artH - 10);
  ctx.lineTo(artX + artW - 10, artY + artH - 10);
  ctx.lineTo(artX + artW - 10, artY + artH - 10 - bracketSize);
  ctx.stroke();

  ctx.restore();

  // Artwork Outer Border
  ctx.strokeStyle = `${glowColor}70`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(artX, artY, artW, artH, artR);
  ctx.stroke();

  // 4. Middle Trait Card Plaque (.monad-trait-card)
  const trX = cardX + pad;
  const trY = artY + artH + 12;
  const trW = cardW - pad * 2;
  const trH = 124;
  const trR = 16;

  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.12)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(trX, trY, trW, trH, trR);
  ctx.fill();
  ctx.stroke();

  // Left Square Thumbnail Box (Shows character artwork thumbnail)
  const sqSize = 56;
  const sqX = trX + 14;
  const sqY = trY + (trH - sqSize) / 2;
  const sqR = 14;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(sqX, sqY, sqSize, sqSize, sqR);
  ctx.clip();

  ctx.fillStyle = `${glowColor}25`;
  ctx.fillRect(sqX, sqY, sqSize, sqSize);
  if (artImg && artImg.naturalWidth > 0) {
    ctx.drawImage(artImg, sqX, sqY, sqSize, sqSize);
  } else {
    ctx.font = '28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeEmoji, sqX + sqSize / 2, sqY + sqSize / 2);
  }
  ctx.restore();

  ctx.strokeStyle = `${glowColor}80`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(sqX, sqY, sqSize, sqSize, sqR);
  ctx.stroke();

  // Right Text Content: Title and Lore
  const textLeft = sqX + sqSize + 14;
  const textMaxW = trW - (textLeft - trX) - 14;

  ctx.font = '900 17px "Space Grotesk", -apple-system, sans-serif';
  ctx.fillStyle = '#0F172A';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(data.archetypeTitle, textLeft, sqY + 18);

  // Wrapped Lore Text
  ctx.font = '500 12px "Inter", "Segoe UI", sans-serif';
  ctx.fillStyle = '#475569';
  const words = data.archetypeLore.split(' ');
  let line = '';
  let lineY = sqY + 36;
  const lineHeight = 17;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > textMaxW && n > 0) {
      ctx.fillText(line.trim(), textLeft, lineY);
      line = words[n] + ' ';
      lineY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), textLeft, lineY);

  // 5. Bottom Footer (.monad-card-footer)
  const ftX = cardX + pad + 4;
  const ftW = cardW - (pad + 4) * 2;
  const ftY = trY + trH + 24;

  // Left Brand: "Rialo Protocol"
  ctx.font = '700 13px "Space Mono", "Courier New", monospace';
  ctx.fillStyle = '#64748B';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('rialo.io', ftX, ftY);

  // Right Rarity Badge matching top pill
  const footerPillH = 26;
  const footerPillText = `${badgeEmoji} ${rarityText}`;
  ctx.font = '800 11px "Space Grotesk", sans-serif';
  const footerTextWidth = ctx.measureText(footerPillText).width;
  const footerPillW = footerTextWidth + 20;
  const footerPillX = ftX + ftW - footerPillW;
  const footerPillY = ftY - footerPillH / 2;

  ctx.fillStyle = `${glowColor}20`;
  ctx.strokeStyle = glowColor;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(footerPillX, footerPillY, footerPillW, footerPillH, 9999);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = glowColor;
  ctx.textAlign = 'center';
  ctx.fillText(footerPillText, footerPillX + footerPillW / 2, ftY);

  ctx.restore(); // Ends card clip

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}


export interface RialoCardBackExportOptions {
  series?: string;
  wave?: string;
  brand?: string;
}

export async function exportRialoCardBackPNG(options?: RialoCardBackExportOptions): Promise<Blob | null> {
  const width = 440;
  const height = 690;
  const scale = 2; // 2x Retina

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.scale(scale, scale);

  // SVG Logo
  const svgString = `<svg width="128" height="128" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(15.5 12) scale(1.1)">
      <path d="M13.8282 23.8508C13.3417 23.3724 12.4023 22.9037 11.723 22.8423C9.26765 22.6202 4.29761 23.3506 2.2706 22.4993C-1.27911 21.0087 -0.456801 15.4679 3.27944 15.1287C5.75258 14.9041 8.54438 15.2856 11.0548 15.1307C16.3182 14.8061 15.8286 8.27627 11.6524 7.9438C9.15239 7.74485 10.8843 7.88424 8.36429 7.71564C3.38359 7.38204 3.11556 0.803867 7.83755 0H19.2015C20.3716 0.140497 21.4965 0.906598 22.0624 1.94538C22.9615 3.5965 22.0855 5.18917 23.8313 6.65933C24.9221 7.57784 25.6307 7.3699 26.8783 7.58458C31.145 8.31854 31.1886 14.9361 26.0746 15.278C23.4536 15.4533 20.6736 15.1204 18.0365 15.3126C14.0722 16.1324 14.102 21.9339 18.1627 22.6038C18.5615 22.6697 19.0258 22.6441 19.404 22.7092C21.0149 22.9864 22.3988 24.4728 22.5278 26.1279C22.3431 28.8338 22.7663 29.9627 22.5238 32.631C22.1237 37.0363 15.2583 37.3342 14.8981 32.257C14.7145 29.6689 15.1837 28.5063 14.893 25.9877C14.8151 25.3119 14.3101 24.3244 13.8284 23.8508H13.8282Z" fill="#A9DDD3"/>
    </g>
  </svg>`;
  const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
  const logoImg = await loadImage(svgDataUrl);

  const cardX = 0;
  const cardY = 0;
  const cardW = width;
  const cardH = height;
  const cardR = 32;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, cardR);
  ctx.clip();

  // 1. Deep Sci-Fi Radial Background (.monad-card-back)
  const cx = cardW / 2;
  const cy = cardH / 2 - 20;
  const maxR = Math.sqrt(cx * cx + cy * cy);
  const radGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
  radGrad.addColorStop(0, 'rgba(169, 221, 211, 0.16)');
  radGrad.addColorStop(0.35, '#071618');
  radGrad.addColorStop(0.7, '#020609');
  radGrad.addColorStop(1, '#010204');
  ctx.fillStyle = radGrad;
  ctx.fillRect(cardX, cardY, cardW, cardH);

  // Outer Border with Mint Teal Glow
  ctx.strokeStyle = 'rgba(169, 221, 211, 0.7)';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Subtle concentric cyber tech circles
  for (const r of [160, 240, 320]) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(169, 221, 211, 0.06)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 8]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Inner Frame Inset
  const inset = 24;
  ctx.strokeStyle = 'rgba(169, 221, 211, 0.2)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(inset, inset, cardW - inset * 2, cardH - inset * 2, 22);
  ctx.stroke();

  // Corner HUD Brackets
  const bLen = 22;
  ctx.strokeStyle = '#A9DDD3';
  ctx.lineWidth = 2;
  // Top-left
  ctx.beginPath();
  ctx.moveTo(inset + 8, inset + 8 + bLen);
  ctx.lineTo(inset + 8, inset + 8);
  ctx.lineTo(inset + 8 + bLen, inset + 8);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.moveTo(cardW - inset - 8 - bLen, inset + 8);
  ctx.lineTo(cardW - inset - 8, inset + 8);
  ctx.lineTo(cardW - inset - 8, inset + 8 + bLen);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(inset + 8, cardH - inset - 8 - bLen);
  ctx.lineTo(inset + 8, cardH - inset - 8);
  ctx.lineTo(inset + 8 + bLen, cardH - inset - 8);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(cardW - inset - 8 - bLen, cardH - inset - 8);
  ctx.lineTo(cardW - inset - 8, cardH - inset - 8);
  ctx.lineTo(cardW - inset - 8, cardH - inset - 8 - bLen);
  ctx.stroke();

  // Top Header (.monad-back-header)
  const hdrY = inset + 32;
  ctx.font = '800 13px "Space Mono", "Courier New", monospace';
  ctx.fillStyle = '#A9DDD3';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('RIALO CARDS', inset + 20, hdrY);

  ctx.textAlign = 'right';
  ctx.fillText(options?.series || 'GENESIS', cardW - inset - 20, hdrY);

  // Center Emblem (.monad-back-emblem)
  const emblemR = 64;
  // Outer soft ring
  ctx.beginPath();
  ctx.arc(cx, cy, emblemR + 12, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(169, 221, 211, 0.15)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Main Emblem Circle
  ctx.save();
  ctx.shadowColor = 'rgba(169, 221, 211, 0.55)';
  ctx.shadowBlur = 30;
  ctx.beginPath();
  ctx.arc(cx, cy, emblemR, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(169, 221, 211, 0.08)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(169, 221, 211, 0.45)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Render Official SVG Glyph inside Emblem
  if (logoImg) {
    const iconW = 68;
    const iconH = 68;
    ctx.drawImage(logoImg, cx - iconW / 2, cy - iconH / 2, iconW, iconH);
  }

  // Title: rialo.io (.monad-back-title)
  const titleY = cy + emblemR + 42;
  ctx.font = '900 28px "Space Grotesk", -apple-system, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(options?.brand || 'rialo.io', cx, titleY);

  // Subtitle: GENESIS WAVE 1 (.monad-back-subtitle)
  const subY = titleY + 30;
  ctx.font = '800 13px "Space Mono", "Courier New", monospace';
  ctx.fillStyle = '#A9DDD3';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(options?.wave || 'GENESIS WAVE 1', cx, subY);

  // Bottom CTA / Badge (.monad-back-cta)
  const ctaW = cardW - (inset + 16) * 2;
  const ctaH = 46;
  const ctaX = inset + 16;
  const ctaY = cardH - inset - 54;

  ctx.save();
  ctx.fillStyle = 'rgba(169, 221, 211, 0.15)';
  ctx.strokeStyle = 'rgba(169, 221, 211, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(ctaX, ctaY, ctaW, ctaH, 14);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.font = '800 12px "Space Mono", "Courier New", monospace';
  ctx.fillStyle = '#A9DDD3';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✦ PROOF OF WORK • ENGAGEMENT ENGINE ✦', cx, ctaY + ctaH / 2);

  ctx.restore(); // Ends card clip

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}
