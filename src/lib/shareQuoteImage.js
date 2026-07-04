export async function generateQuoteBlob(quote, backgroundUrl) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");

  // Background image
  if (backgroundUrl) {
    try {
      const img = await loadImage(backgroundUrl);
      const ratio = Math.max(canvas.width / img.width, canvas.height / img.height);
      const w = img.width * ratio;
      const h = img.height * ratio;
      ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
    } catch {
      drawGradient(ctx, canvas);
    }
  } else {
    drawGradient(ctx, canvas);
  }

  // Dark overlay
  const overlay = ctx.createLinearGradient(0, 0, 0, canvas.height);
  overlay.addColorStop(0, "rgba(0,0,0,0.3)");
  overlay.addColorStop(0.5, "rgba(0,0,0,0.4)");
  overlay.addColorStop(1, "rgba(0,0,0,0.65)");
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Quote text
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0,0,0,0.4)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 4;

  const fontSize = 56;
  ctx.font = `500 ${fontSize}px Inter, sans-serif`;
  const maxWidth = canvas.width - 160;
  const lines = wrapText(ctx, quote.text, maxWidth);
  const lineHeight = fontSize * 1.4;
  const startY = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line, canvas.width / 2, startY + i * lineHeight);
  });

  // Author
  if (quote.author) {
    ctx.shadowBlur = 8;
    ctx.font = `300 32px Inter, sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText(`— ${quote.author}`, canvas.width / 2, startY + lines.length * lineHeight + 40);
  }

  ctx.shadowColor = "transparent";
  return await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function downloadQuoteImage(quote, backgroundUrl) {
  const blob = await generateQuoteBlob(quote, backgroundUrl);
  downloadBlob(blob, "daily-spark-quote.png");
}

export async function shareQuoteAsImage(quote, backgroundUrl) {
  const blob = await generateQuoteBlob(quote, backgroundUrl);
  const file = new File([blob], "daily-spark-quote.png", { type: "image/png" });

  const shareText = `"${quote.text}"${quote.author ? ` — ${quote.author}` : ""}`;
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({ files: [file], text: shareText });
  } else {
    downloadBlob(blob, "daily-spark-quote.png");
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawGradient(ctx, canvas) {
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, "#9333ea");
  grad.addColorStop(1, "#ec4899");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}