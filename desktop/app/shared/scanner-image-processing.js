(function initializeScannerImageProcessing(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.TcgScannerImageProcessing = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createScannerImageProcessing() {
  "use strict";

  const CARD_ASPECT = 0.68;
  const REGION_LAYOUTS = Object.freeze({
    title: { x: 0.035, y: 0.050, width: 0.82, height: 0.075, targetHeight: 220 },
    setCode: { x: 0.664, y: 0.6614, width: 0.222, height: 0.0369, targetHeight: 100 },
    footer: { x: 0.014, y: 0.920, width: 0.359, height: 0.037, targetHeight: 100 },
    artwork: { x: 0.10, y: 0.18, width: 0.80, height: 0.48, targetHeight: 420 }
  });

  const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));

  function boundedRect(rect, width, height) {
    const left = clamp(Math.round(rect.left), 0, Math.max(0, width - 1));
    const top = clamp(Math.round(rect.top), 0, Math.max(0, height - 1));
    const right = clamp(Math.round(rect.left + rect.width), left + 1, width);
    const bottom = clamp(Math.round(rect.top + rect.height), top + 1, height);
    return { left, top, width: right - left, height: bottom - top };
  }

  function rectIntersectionRatio(left, right) {
    const x0 = Math.max(left.left, right.left);
    const y0 = Math.max(left.top, right.top);
    const x1 = Math.min(left.left + left.width, right.left + right.width);
    const y1 = Math.min(left.top + left.height, right.top + right.height);
    const intersection = Math.max(0, x1 - x0) * Math.max(0, y1 - y0);
    const union = left.width * left.height + right.width * right.height - intersection;
    return union > 0 ? intersection / union : 0;
  }

  function fallbackBounds(width, height, heightRatio = 0.70, centerY = 0.57) {
    let cardHeight = height * heightRatio;
    let cardWidth = cardHeight * CARD_ASPECT;
    if (cardWidth > width * 0.92) {
      cardWidth = width * 0.92;
      cardHeight = cardWidth / CARD_ASPECT;
    }
    return boundedRect({
      left: (width - cardWidth) / 2,
      top: height * centerY - cardHeight / 2,
      width: cardWidth,
      height: cardHeight
    }, width, height);
  }

  function detectCardBoundsFromRgba(data, width, height) {
    if (!data || width < 80 || height < 120) return fallbackBounds(width, height);
    const maxDimension = 240;
    const scale = Math.min(1, maxDimension / Math.max(width, height));
    const smallWidth = Math.max(40, Math.round(width * scale));
    const smallHeight = Math.max(60, Math.round(height * scale));
    const gray = new Float32Array(smallWidth * smallHeight);
    for (let y = 0; y < smallHeight; y += 1) {
      const sourceY = Math.min(height - 1, Math.floor(y / scale));
      for (let x = 0; x < smallWidth; x += 1) {
        const sourceX = Math.min(width - 1, Math.floor(x / scale));
        const offset = (sourceY * width + sourceX) * 4;
        gray[y * smallWidth + x] = data[offset] * 0.299 + data[offset + 1] * 0.587 + data[offset + 2] * 0.114;
      }
    }

    const gradientX = new Float32Array(gray.length);
    const gradientY = new Float32Array(gray.length);
    let averageGradient = 0;
    for (let y = 1; y < smallHeight - 1; y += 1) {
      for (let x = 1; x < smallWidth - 1; x += 1) {
        const index = y * smallWidth + x;
        gradientX[index] = Math.abs(gray[index + 1] - gray[index - 1]);
        gradientY[index] = Math.abs(gray[index + smallWidth] - gray[index - smallWidth]);
        averageGradient += gradientX[index] + gradientY[index];
      }
    }
    averageGradient /= Math.max(1, (smallWidth - 2) * (smallHeight - 2) * 2);

    const verticalEdge = (x, startY, endY) => {
      let total = 0;
      let count = 0;
      for (let y = startY; y <= endY; y += 2) {
        let strongest = 0;
        for (let offset = -3; offset <= 3; offset += 1) {
          const safeX = clamp(x + offset, 1, smallWidth - 2);
          strongest = Math.max(strongest, gradientX[y * smallWidth + safeX]);
        }
        total += strongest;
        count += 1;
      }
      return total / Math.max(1, count);
    };
    const horizontalEdge = (y, startX, endX) => {
      let total = 0;
      let count = 0;
      for (let x = startX; x <= endX; x += 2) {
        let strongest = 0;
        for (let offset = -3; offset <= 3; offset += 1) {
          const safeY = clamp(y + offset, 1, smallHeight - 2);
          strongest = Math.max(strongest, gradientY[safeY * smallWidth + x]);
        }
        total += strongest;
        count += 1;
      }
      return total / Math.max(1, count);
    };

    let best = null;
    for (const aspect of [0.62, 0.65, 0.68, 0.71, 0.74]) {
      for (let heightRatio = 0.58; heightRatio <= 0.96; heightRatio += 0.03) {
        const candidateHeight = Math.round(smallHeight * heightRatio);
        const candidateWidth = Math.round(candidateHeight * aspect);
        if (candidateWidth > smallWidth * 0.96) continue;
        for (let centerX = 0.36; centerX <= 0.64; centerX += 0.02) {
          for (let centerY = 0.42; centerY <= 0.68; centerY += 0.02) {
            const left = Math.round(smallWidth * centerX - candidateWidth / 2);
            const top = Math.round(smallHeight * centerY - candidateHeight / 2);
            const right = left + candidateWidth;
            const bottom = top + candidateHeight;
            if (left < 2 || top < 2 || right >= smallWidth - 2 || bottom >= smallHeight - 2) continue;
            const trimX = Math.max(3, Math.round(candidateWidth * 0.05));
            const trimY = Math.max(3, Math.round(candidateHeight * 0.04));
            const vertical = (
              verticalEdge(left, top + trimY, bottom - trimY) +
              verticalEdge(right, top + trimY, bottom - trimY)
            ) / 2;
            const horizontal = (
              horizontalEdge(top, left + trimX, right - trimX) +
              horizontalEdge(bottom, left + trimX, right - trimX)
            ) / 2;
            const centerPrior = 1 - Math.min(1, Math.abs(centerX - 0.5) * 1.5 + Math.abs(centerY - 0.56));
            const score = (vertical * 0.62 + horizontal * 0.38) / Math.max(1, averageGradient) + centerPrior * 0.2 + heightRatio * 0.08;
            if (!best || score > best.score) best = { left, top, width: candidateWidth, height: candidateHeight, score };
          }
        }
      }
    }

    if (!best) return fallbackBounds(width, height);
    const detected = {
      left: best.left / scale,
      top: best.top / scale,
      width: best.width / scale,
      height: best.height / scale
    };
    return boundedRect({
      left: detected.left - detected.width * 0.05,
      top: detected.top - detected.height * 0.04,
      width: detected.width * 1.10,
      height: detected.height * 1.16
    }, width, height);
  }

  function candidateBoundsFromRgba(data, width, height) {
    const candidates = [
      detectCardBoundsFromRgba(data, width, height),
      fallbackBounds(width, height, 0.70, 0.57),
      fallbackBounds(width, height, 0.90, 0.51)
    ];
    return candidates.filter((candidate, index, rows) =>
      rows.findIndex(other => rectIntersectionRatio(candidate, other) > 0.88) === index
    ).slice(0, 2);
  }

  function regionRect(bounds, kind, imageWidth, imageHeight) {
    const layout = REGION_LAYOUTS[kind];
    if (!layout) return boundedRect(bounds, imageWidth, imageHeight);
    return boundedRect({
      left: bounds.left + bounds.width * layout.x,
      top: bounds.top + bounds.height * layout.y,
      width: bounds.width * layout.width,
      height: bounds.height * layout.height
    }, imageWidth, imageHeight);
  }

  function loadImage(dataUrl) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Das Kartenfoto konnte nicht vorbereitet werden."));
      image.src = dataUrl;
    });
  }

  function percentile(histogram, total, ratio) {
    const wanted = total * ratio;
    let current = 0;
    for (let value = 0; value < histogram.length; value += 1) {
      current += histogram[value];
      if (current >= wanted) return value;
    }
    return 255;
  }

  function normalizedRegionDataUrl(image, rect, kind, channel = "luma") {
    const layout = REGION_LAYOUTS[kind] || REGION_LAYOUTS.title;
    const scale = clamp(layout.targetHeight / Math.max(1, rect.height), 0.75, 3.2);
    const canvas = document.createElement("canvas");
    canvas.width = clamp(Math.round(rect.width * scale), 120, 1900);
    canvas.height = clamp(Math.round(rect.height * scale), 70, 360);
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, rect.left, rect.top, rect.width, rect.height, 0, 0, canvas.width, canvas.height);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    const histogram = new Uint32Array(256);
    const values = new Uint8Array(canvas.width * canvas.height);
    for (let index = 0; index < values.length; index += 1) {
      const offset = index * 4;
      const red = pixels.data[offset];
      const green = pixels.data[offset + 1];
      const blue = pixels.data[offset + 2];
      const value = channel === "red" ? red : channel === "blue" ? blue : Math.round(red * 0.299 + green * 0.587 + blue * 0.114);
      values[index] = value;
      histogram[value] += 1;
    }
    const low = percentile(histogram, values.length, 0.02);
    const high = Math.max(low + 12, percentile(histogram, values.length, 0.98));
    for (let index = 0; index < values.length; index += 1) {
      const normalized = clamp(Math.round((values[index] - low) * 255 / (high - low)), 0, 255);
      const offset = index * 4;
      pixels.data[offset] = normalized;
      pixels.data[offset + 1] = normalized;
      pixels.data[offset + 2] = normalized;
      pixels.data[offset + 3] = 255;
    }
    context.putImageData(pixels, 0, 0);
    return canvas.toDataURL("image/png");
  }

  function artworkDataUrl(image, bounds) {
    const rect = regionRect(bounds, "artwork", image.naturalWidth, image.naturalHeight);
    const canvas = document.createElement("canvas");
    const scale = clamp(REGION_LAYOUTS.artwork.targetHeight / Math.max(1, rect.height), 0.3, 1);
    canvas.width = Math.max(80, Math.round(rect.width * scale));
    canvas.height = Math.max(100, Math.round(rect.height * scale));
    const context = canvas.getContext("2d");
    context.drawImage(image, rect.left, rect.top, rect.width, rect.height, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.82);
  }

  async function prepareRecognitionPayload(imageDataUrl) {
    const image = await loadImage(imageDataUrl);
    const detectionCanvas = document.createElement("canvas");
    detectionCanvas.width = image.naturalWidth;
    detectionCanvas.height = image.naturalHeight;
    const detectionContext = detectionCanvas.getContext("2d", { willReadFrequently: true });
    detectionContext.drawImage(image, 0, 0);
    const pixels = detectionContext.getImageData(0, 0, detectionCanvas.width, detectionCanvas.height);
    const bounds = candidateBoundsFromRgba(pixels.data, pixels.width, pixels.height);
    const passes = [];
    bounds.forEach((cardBounds, candidateIndex) => {
      const titleRect = regionRect(cardBounds, "title", pixels.width, pixels.height);
      const setCodeRect = regionRect(cardBounds, "setCode", pixels.width, pixels.height);
      const footerRect = regionRect(cardBounds, "footer", pixels.width, pixels.height);
      passes.push({ kind: "title", variant: `candidate-${candidateIndex + 1}-blue`, imageDataUrl: normalizedRegionDataUrl(image, titleRect, "title", "blue") });
      passes.push({ kind: "title", variant: `candidate-${candidateIndex + 1}-red`, imageDataUrl: normalizedRegionDataUrl(image, titleRect, "title", "red") });
      passes.push({ kind: "setCode", variant: `candidate-${candidateIndex + 1}-red`, imageDataUrl: normalizedRegionDataUrl(image, setCodeRect, "setCode", "red") });
      if (candidateIndex === 0) passes.push({ kind: "setCode", variant: "candidate-1-luma", imageDataUrl: normalizedRegionDataUrl(image, setCodeRect, "setCode", "luma") });
      passes.push({ kind: "footer", variant: `candidate-${candidateIndex + 1}-red`, imageDataUrl: normalizedRegionDataUrl(image, footerRect, "footer", "red") });
    });
    return {
      imageDataUrl,
      passes: passes.slice(0, 12),
      cardBounds: bounds,
      fingerprintImageDataUrl: artworkDataUrl(image, bounds[0])
    };
  }

  return Object.freeze({
    CARD_ASPECT,
    REGION_LAYOUTS,
    boundedRect,
    fallbackBounds,
    detectCardBoundsFromRgba,
    candidateBoundsFromRgba,
    regionRect,
    prepareRecognitionPayload
  });
});
