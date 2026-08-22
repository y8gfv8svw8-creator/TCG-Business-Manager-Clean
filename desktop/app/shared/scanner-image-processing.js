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
    return union > 0 ? clamp(intersection / union, 0, 1) : 0;
  }

  function normalizedBoundingBox(value) {
    if (!value || typeof value !== "object") return null;
    const x = Number(value.x);
    const y = Number(value.y);
    const width = Number(value.width);
    const height = Number(value.height);
    if (![x, y, width, height].every(Number.isFinite)) return null;
    if (x < 0 || y < 0 || width <= 0 || height <= 0 || x + width > 1.000001 || y + height > 1.000001) return null;
    return { x, y, width, height };
  }

  function boundingBoxIoU(left, right) {
    const a = normalizedBoundingBox(left?.boundingBox || left);
    const b = normalizedBoundingBox(right?.boundingBox || right);
    if (!a || !b) return 0;
    return rectIntersectionRatio(
      { left: a.x, top: a.y, width: a.width, height: a.height },
      { left: b.x, top: b.y, width: b.width, height: b.height }
    );
  }

  function downsampleRgba(data, width, height, maxDimension = 480) {
    const scale = Math.min(1, maxDimension / Math.max(width, height));
    const targetWidth = Math.max(24, Math.round(width * scale));
    const targetHeight = Math.max(24, Math.round(height * scale));
    const gray = new Float32Array(targetWidth * targetHeight);
    let sum = 0;
    let sumSquares = 0;
    let dark = 0;
    let bright = 0;
    for (let y = 0; y < targetHeight; y += 1) {
      const sourceY = Math.min(height - 1, Math.floor(y / scale));
      for (let x = 0; x < targetWidth; x += 1) {
        const sourceX = Math.min(width - 1, Math.floor(x / scale));
        const offset = (sourceY * width + sourceX) * 4;
        const value = data[offset] * 0.299 + data[offset + 1] * 0.587 + data[offset + 2] * 0.114;
        const index = y * targetWidth + x;
        gray[index] = value;
        sum += value;
        sumSquares += value * value;
        if (value < 35) dark += 1;
        if (value > 245) bright += 1;
      }
    }
    const count = Math.max(1, gray.length);
    const mean = sum / count;
    return {
      gray,
      width: targetWidth,
      height: targetHeight,
      scale,
      brightness: mean,
      contrast: Math.sqrt(Math.max(0, sumSquares / count - mean * mean)),
      darkRatio: dark / count,
      overexposedRatio: bright / count
    };
  }

  function gradientAnalysis(gray, width, height) {
    const gradientX = new Float32Array(gray.length);
    const gradientY = new Float32Array(gray.length);
    const magnitude = new Float32Array(gray.length);
    const histogram = new Uint32Array(512);
    let total = 0;
    let totalSquares = 0;
    let count = 0;
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const index = y * width + x;
        const gx = Math.abs(gray[index + 1] - gray[index - 1]);
        const gy = Math.abs(gray[index + width] - gray[index - width]);
        const value = Math.min(511, Math.round(gx + gy));
        gradientX[index] = gx;
        gradientY[index] = gy;
        magnitude[index] = value;
        histogram[value] += 1;
        total += value;
        totalSquares += value * value;
        count += 1;
      }
    }
    const mean = total / Math.max(1, count);
    const deviation = Math.sqrt(Math.max(0, totalSquares / Math.max(1, count) - mean * mean));
    const threshold = Math.max(14, percentile(histogram, Math.max(1, count), 0.78), mean + deviation * 0.45);
    return { gradientX, gradientY, magnitude, mean, deviation, threshold };
  }

  function integralImage(values, width, height) {
    const stride = width + 1;
    const integral = new Float64Array(stride * (height + 1));
    for (let y = 0; y < height; y += 1) {
      let row = 0;
      for (let x = 0; x < width; x += 1) {
        row += values[y * width + x];
        integral[(y + 1) * stride + x + 1] = integral[y * stride + x + 1] + row;
      }
    }
    return { integral, stride };
  }

  function regionMean(source, left, top, width, height) {
    const x0 = Math.max(0, Math.round(left));
    const y0 = Math.max(0, Math.round(top));
    const x1 = Math.min(source.stride - 1, Math.round(left + width));
    const y1 = Math.min(source.integral.length / source.stride - 1, Math.round(top + height));
    if (x1 <= x0 || y1 <= y0) return 0;
    const total = source.integral[y1 * source.stride + x1]
      - source.integral[y0 * source.stride + x1]
      - source.integral[y1 * source.stride + x0]
      + source.integral[y0 * source.stride + x0];
    return total / ((x1 - x0) * (y1 - y0));
  }

  function imageQualityFromAnalysis(sample, gradients) {
    const warnings = [];
    if (sample.brightness < 55 || sample.darkRatio > 0.55) warnings.push("very_dark");
    if (sample.brightness > 215 || sample.overexposedRatio > 0.38) warnings.push("overexposed");
    if (sample.contrast < 22) warnings.push("low_contrast");
    if (gradients.mean < 7) warnings.push("possibly_blurred");
    return {
      brightness: Math.round(sample.brightness * 10) / 10,
      contrast: Math.round(sample.contrast * 10) / 10,
      sharpness: Math.round(gradients.mean * 10) / 10,
      darkRatio: Math.round(sample.darkRatio * 1000) / 1000,
      overexposedRatio: Math.round(sample.overexposedRatio * 1000) / 1000,
      warnings
    };
  }

  function binaryEdgeComponents(gradients, width, height) {
    const strong = new Uint8Array(width * height);
    for (let index = 0; index < strong.length; index += 1) strong[index] = gradients.magnitude[index] >= gradients.threshold ? 1 : 0;
    const expanded = new Uint8Array(strong.length);
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        let found = 0;
        for (let dy = -1; dy <= 1 && !found; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) if (strong[(y + dy) * width + x + dx]) { found = 1; break; }
        }
        expanded[y * width + x] = found;
      }
    }
    const visited = new Uint8Array(strong.length);
    const components = [];
    const stack = [];
    for (let start = 0; start < expanded.length; start += 1) {
      if (!expanded[start] || visited[start]) continue;
      visited[start] = 1;
      stack.push(start);
      let minX = width;
      let minY = height;
      let maxX = 0;
      let maxY = 0;
      let pixels = 0;
      let edgePixels = 0;
      let sumX = 0;
      let sumY = 0;
      let sumXX = 0;
      let sumYY = 0;
      let sumXY = 0;
      while (stack.length) {
        const index = stack.pop();
        const x = index % width;
        const y = Math.floor(index / width);
        minX = Math.min(minX, x);maxX = Math.max(maxX, x);minY = Math.min(minY, y);maxY = Math.max(maxY, y);pixels += 1;
        if (strong[index]) { edgePixels += 1;sumX += x;sumY += y;sumXX += x * x;sumYY += y * y;sumXY += x * y; }
        for (let dy = -1; dy <= 1; dy += 1) for (let dx = -1; dx <= 1; dx += 1) {
          if (!dx && !dy) continue;
          const nextX = x + dx;
          const nextY = y + dy;
          if (nextX < 1 || nextY < 1 || nextX >= width - 1 || nextY >= height - 1) continue;
          const next = nextY * width + nextX;
          if (expanded[next] && !visited[next]) { visited[next] = 1;stack.push(next); }
        }
      }
      const componentWidth = maxX - minX + 1;
      const componentHeight = maxY - minY + 1;
      if (pixels < 18 || edgePixels < 8 || componentWidth < 10 || componentHeight < 14) continue;
      const meanX = sumX / Math.max(1, edgePixels);
      const meanY = sumY / Math.max(1, edgePixels);
      const covarianceX = sumXX / Math.max(1, edgePixels) - meanX * meanX;
      const covarianceY = sumYY / Math.max(1, edgePixels) - meanY * meanY;
      const covarianceXY = sumXY / Math.max(1, edgePixels) - meanX * meanY;
      const axisAngle = 0.5 * Math.atan2(2 * covarianceXY, covarianceX - covarianceY) * 180 / Math.PI;
      const rotation = Math.min(Math.abs(axisAngle - 90), Math.abs(axisAngle + 90), Math.abs(axisAngle));
      components.push({ left: minX, top: minY, width: componentWidth, height: componentHeight, pixels, edgePixels, rotation });
    }
    return components;
  }

  function foregroundComponents(sample) {
    const { gray, width, height } = sample;
    const borderHistogram = new Uint32Array(256);
    let borderCount = 0;
    const border = Math.max(2, Math.round(Math.min(width, height) * 0.045));
    for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
      if (x >= border && x < width - border && y >= border && y < height - border) continue;
      borderHistogram[Math.max(0, Math.min(255, Math.round(gray[y * width + x])))] += 1;borderCount += 1;
    }
    const background = percentile(borderHistogram, Math.max(1, borderCount), 0.5);
    const threshold = Math.max(12, sample.contrast * 0.24);
    const mask = new Uint8Array(gray.length);
    for (let index = 0; index < mask.length; index += 1) mask[index] = Math.abs(gray[index] - background) >= threshold ? 1 : 0;
    const expanded = new Uint8Array(mask.length);
    for (let y = 1; y < height - 1; y += 1) for (let x = 1; x < width - 1; x += 1) {
      let found = 0;
      for (let dy = -1; dy <= 1 && !found; dy += 1) for (let dx = -1; dx <= 1; dx += 1) if (mask[(y + dy) * width + x + dx]) { found = 1;break; }
      expanded[y * width + x] = found;
    }
    const visited = new Uint8Array(mask.length);
    const components = [];
    const stack = [];
    for (let start = 0; start < expanded.length; start += 1) {
      if (!expanded[start] || visited[start]) continue;
      visited[start] = 1;stack.push(start);
      let minX = width;let minY = height;let maxX = 0;let maxY = 0;let pixels = 0;let foregroundPixels = 0;let sumX = 0;let sumY = 0;let sumXX = 0;let sumYY = 0;let sumXY = 0;
      while (stack.length) {
        const index = stack.pop();const x = index % width;const y = Math.floor(index / width);
        minX = Math.min(minX, x);maxX = Math.max(maxX, x);minY = Math.min(minY, y);maxY = Math.max(maxY, y);pixels += 1;
        if (mask[index]) { foregroundPixels += 1;sumX += x;sumY += y;sumXX += x * x;sumYY += y * y;sumXY += x * y; }
        for (let dy = -1; dy <= 1; dy += 1) for (let dx = -1; dx <= 1; dx += 1) {
          if (!dx && !dy) continue;const nextX = x + dx;const nextY = y + dy;
          if (nextX < 1 || nextY < 1 || nextX >= width - 1 || nextY >= height - 1) continue;
          const next = nextY * width + nextX;if (expanded[next] && !visited[next]) { visited[next] = 1;stack.push(next); }
        }
      }
      const componentWidth = maxX - minX + 1;const componentHeight = maxY - minY + 1;const area = componentWidth * componentHeight;
      if (componentWidth < 18 || componentHeight < 26 || area < width * height * 0.007 || foregroundPixels / Math.max(1, area) < 0.14) continue;
      const meanX = sumX / Math.max(1, foregroundPixels);const meanY = sumY / Math.max(1, foregroundPixels);
      const covarianceX = sumXX / Math.max(1, foregroundPixels) - meanX * meanX;const covarianceY = sumYY / Math.max(1, foregroundPixels) - meanY * meanY;const covarianceXY = sumXY / Math.max(1, foregroundPixels) - meanX * meanY;
      const axisAngle = 0.5 * Math.atan2(2 * covarianceXY, covarianceX - covarianceY) * 180 / Math.PI;
      const rotation = Math.min(Math.abs(axisAngle - 90), Math.abs(axisAngle + 90), Math.abs(axisAngle));
      components.push({ left: minX, top: minY, width: componentWidth, height: componentHeight, fillRatio: foregroundPixels / Math.max(1, area), rotation });
    }
    return components;
  }

  function edgeContinuity(rect, gradients, width, height, band) {
    const samples = 24;
    const sides = [0, 0, 0, 0];
    for (let step = 0; step < samples; step += 1) {
      const ratio = (step + 0.5) / samples;
      const y = clamp(Math.round(rect.top + rect.height * ratio), 1, height - 2);
      const x = clamp(Math.round(rect.left + rect.width * ratio), 1, width - 2);
      let left = 0;let right = 0;let top = 0;let bottom = 0;
      for (let offset = -band; offset <= band; offset += 1) {
        left = Math.max(left, gradients.gradientX[y * width + clamp(rect.left + offset, 1, width - 2)]);
        right = Math.max(right, gradients.gradientX[y * width + clamp(rect.left + rect.width - 1 + offset, 1, width - 2)]);
        top = Math.max(top, gradients.gradientY[clamp(rect.top + offset, 1, height - 2) * width + x]);
        bottom = Math.max(bottom, gradients.gradientY[clamp(rect.top + rect.height - 1 + offset, 1, height - 2) * width + x]);
      }
      const wanted = gradients.threshold * 0.48;
      if (left >= wanted) sides[0] += 1;
      if (right >= wanted) sides[1] += 1;
      if (top >= wanted) sides[2] += 1;
      if (bottom >= wanted) sides[3] += 1;
    }
    const ratios = sides.map(value => value / samples);
    return { value: ratios.reduce((sum, value) => sum + value, 0) / 4, sides: ratios };
  }

  function scoreCardRectangle(rect, context, componentStrength = 0, rotation = null) {
    const { width, height, gradients, integralX, integralY } = context;
    if (rect.left < 1 || rect.top < 1 || rect.left + rect.width >= width - 1 || rect.top + rect.height >= height - 1) return null;
    const aspect = rect.width / rect.height;
    if (aspect < 0.46 || aspect > 0.92) return null;
    const areaRatio = rect.width * rect.height / (width * height);
    if (areaRatio < 0.007 || areaRatio > 0.94) return null;
    const band = Math.max(1, Math.round(Math.min(rect.width, rect.height) * 0.022));
    const trimX = Math.max(2, Math.round(rect.width * 0.04));
    const trimY = Math.max(2, Math.round(rect.height * 0.04));
    const sides = [
      regionMean(integralX, rect.left - band, rect.top + trimY, band * 2 + 1, rect.height - trimY * 2),
      regionMean(integralX, rect.left + rect.width - band - 1, rect.top + trimY, band * 2 + 1, rect.height - trimY * 2),
      regionMean(integralY, rect.left + trimX, rect.top - band, rect.width - trimX * 2, band * 2 + 1),
      regionMean(integralY, rect.left + trimX, rect.top + rect.height - band - 1, rect.width - trimX * 2, band * 2 + 1)
    ];
    const sideAverage = sides.reduce((sum, value) => sum + value, 0) / 4;
    const maximumSide = Math.max(...sides, 1);
    const edgeStrength = clamp((sideAverage - gradients.mean * 0.8) / Math.max(8, gradients.threshold * 0.55), 0, 1);
    const edgeBalance = clamp(Math.min(...sides) / maximumSide, 0, 1);
    const continuity = edgeContinuity(rect, gradients, width, height, Math.max(1, band));
    const strongSideCount = continuity.sides.filter(value => value >= 0.35).length;
    const strongComponent = componentStrength >= 0.65;
    if ((!componentStrength && (strongSideCount < 4 || continuity.value < 0.42))
      || (componentStrength && !strongComponent && (strongSideCount < 3 || continuity.value < 0.38))
      || (strongComponent && continuity.value < 0.04)) return null;
    const aspectScore = clamp(1 - Math.abs(aspect - CARD_ASPECT) / 0.25, 0, 1);
    const areaScore = clamp(areaRatio / 0.025, 0.35, 1);
    const calculatedScore = clamp(edgeStrength * 0.29 + continuity.value * 0.27 + edgeBalance * 0.12 + aspectScore * 0.16 + areaScore * 0.05 + componentStrength * 0.11, 0, 1);
    const score = strongComponent ? Math.max(calculatedScore, 0.55 + aspectScore * 0.16 + continuity.value * 0.08) : calculatedScore;
    return {
      ...rect,
      score,
      candidateSource: componentStrength ? "edge_component" : "window_scan",
      signals: {
        edgeStrength: Math.round(edgeStrength * 1000) / 1000,
        edgeContinuity: Math.round(continuity.value * 1000) / 1000,
        edgeBalance: Math.round(edgeBalance * 1000) / 1000,
        aspectRatio: Math.round(aspect * 1000) / 1000,
        aspectScore: Math.round(aspectScore * 1000) / 1000,
        areaRatio: Math.round(areaRatio * 10000) / 10000,
        rotationDegrees: rotation == null ? null : Math.round(rotation * 10) / 10,
        sideContinuity: continuity.sides.map(value => Math.round(value * 1000) / 1000)
      }
    };
  }

  function rectContainment(inner, outer) {
    const x0 = Math.max(inner.left, outer.left);
    const y0 = Math.max(inner.top, outer.top);
    const x1 = Math.min(inner.left + inner.width, outer.left + outer.width);
    const y1 = Math.min(inner.top + inner.height, outer.top + outer.height);
    const intersection = Math.max(0, x1 - x0) * Math.max(0, y1 - y0);
    return intersection / Math.max(1, inner.width * inner.height);
  }

  function deduplicateRectangles(candidates, iouThreshold = 0.45) {
    const sorted = [...candidates].sort((left, right) => right.score - left.score);
    const kept = [];
    for (const candidate of sorted) {
      if (kept.some(existing => rectIntersectionRatio(candidate, existing) >= iouThreshold)) continue;
      kept.push(candidate);
    }
    return kept.filter(outer => {
      if (outer.candidateSource !== "window_scan") return true;
      const contained = kept.filter(inner => inner !== outer
        && inner.width * inner.height < outer.width * outer.height * 0.58
        && rectContainment(inner, outer) >= 0.82);
      return contained.length < 2;
    });
  }

  function assignGridPositions(candidates) {
    if (candidates.length < 4) return candidates.map(row => ({ ...row, row: "", column: "" }));
    const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
    const medianWidth = median(candidates.map(row => row.width));
    const medianHeight = median(candidates.map(row => row.height));
    const sizeVariation = candidates.reduce((sum, row) => sum + Math.abs(row.width - medianWidth) / Math.max(1, medianWidth) + Math.abs(row.height - medianHeight) / Math.max(1, medianHeight), 0) / (candidates.length * 2);
    if (sizeVariation > 0.28) return candidates.map(row => ({ ...row, row: "", column: "" }));
    const cluster = (axis, tolerance) => {
      const dimension = axis === "left" ? "width" : "height";
      const rows = [...candidates].sort((a, b) => (a[axis] + a[dimension] / 2) - (b[axis] + b[dimension] / 2));
      const groups = [];
      rows.forEach(item => {
        const center = item[axis] + item[dimension] / 2;
        let target = groups.find(group => Math.abs(group.center - center) <= tolerance);
        if (!target) { target = { center, items: [] };groups.push(target); }
        target.items.push(item);target.center = target.items.reduce((sum, row) => sum + row[axis] + row[dimension] / 2, 0) / target.items.length;
      });
      return groups;
    };
    const rows = cluster("top", medianHeight * 0.38);
    const columns = cluster("left", medianWidth * 0.38);
    if (rows.length < 2 || columns.length < 2 || rows.length * columns.length < candidates.length * 0.70) return candidates.map(row => ({ ...row, row: "", column: "" }));
    return candidates.map(candidate => {
      const row = rows.findIndex(group => group.items.includes(candidate));
      const column = columns.findIndex(group => group.items.includes(candidate));
      return { ...candidate, row: row >= 0 ? String(row + 1) : "", column: column >= 0 ? String(column + 1) : "", signals: { ...candidate.signals, gridSupport: row >= 0 && column >= 0 } };
    });
  }

  function detectCollectionCardsFromRgba(data, width, height, options = {}) {
    if (!data || width < 40 || height < 40) return { detections: [], photoQuality: { warnings: ["image_too_small"] }, parameters: { iouThreshold: 0.45 } };
    const sample = downsampleRgba(data, width, height, options.maxDimension || 480);
    const gradients = gradientAnalysis(sample.gray, sample.width, sample.height);
    const photoQuality = imageQualityFromAnalysis(sample, gradients);
    if (photoQuality.warnings.includes("low_contrast") && gradients.mean < 4) return { detections: [], photoQuality, parameters: { iouThreshold: 0.45, minimumScore: 0.60 } };
    const integralX = integralImage(gradients.gradientX, sample.width, sample.height);
    const integralY = integralImage(gradients.gradientY, sample.width, sample.height);
    const context = { width: sample.width, height: sample.height, gradients, integralX, integralY };
    const candidates = [];
    for (const component of foregroundComponents(sample)) {
      const scored = scoreCardRectangle(component, context, clamp(component.fillRatio * 1.8, 0, 1), component.rotation);
      if (scored && scored.score >= 0.52) { scored.candidateSource = "contrast_component";candidates.push(scored); }
    }
    for (const component of binaryEdgeComponents(gradients, sample.width, sample.height)) {
      const perimeter = Math.max(1, 2 * (component.width + component.height));
      const strength = clamp(component.edgePixels / perimeter, 0, 1);
      const scored = scoreCardRectangle(component, context, strength, component.rotation);
      if (scored && scored.score >= 0.48) candidates.push(scored);
    }
    const heightRatios = options.heightRatios || [0.18, 0.23, 0.29, 0.36, 0.45, 0.56, 0.70, 0.86];
    for (const heightRatio of heightRatios) {
      const candidateHeight = Math.round(sample.height * heightRatio);
      if (candidateHeight < 26) continue;
      for (const aspect of [0.60, 0.68, 0.76]) {
        const candidateWidth = Math.round(candidateHeight * aspect);
        if (candidateWidth < 18 || candidateWidth >= sample.width - 4) continue;
        const stepX = Math.max(3, Math.round(candidateWidth * 0.11));
        const stepY = Math.max(3, Math.round(candidateHeight * 0.09));
        const band = Math.max(1, Math.round(Math.min(candidateWidth, candidateHeight) * 0.025));
        for (let top = 2; top + candidateHeight < sample.height - 2; top += stepY) {
          for (let left = 2; left + candidateWidth < sample.width - 2; left += stepX) {
            const vertical = (regionMean(integralX, left - band, top, band * 2 + 1, candidateHeight) + regionMean(integralX, left + candidateWidth - band - 1, top, band * 2 + 1, candidateHeight)) / 2;
            const horizontal = (regionMean(integralY, left, top - band, candidateWidth, band * 2 + 1) + regionMean(integralY, left, top + candidateHeight - band - 1, candidateWidth, band * 2 + 1)) / 2;
            if (Math.min(vertical, horizontal) < Math.max(gradients.mean * 1.05, gradients.threshold * 0.10)) continue;
            const scored = scoreCardRectangle({ left, top, width: candidateWidth, height: candidateHeight }, context);
            if (scored && scored.score >= 0.54) candidates.push(scored);
          }
        }
      }
    }
    const minimumScore = clamp(Number(options.minimumScore ?? 0.60), 0.45, 0.95);
    const reliableComponents = candidates.filter(row => row.candidateSource !== "window_scan" && row.score >= 0.67);
    const consideredCandidates = reliableComponents.length
      ? candidates.filter(row => row.candidateSource !== "window_scan" || row.score >= 0.74)
      : candidates;
    const deduplicated = assignGridPositions(deduplicateRectangles(consideredCandidates, Number(options.iouThreshold || 0.45)))
      .filter(row => row.score >= minimumScore)
      .slice(0, Math.max(1, Number(options.maximumDetections || 80)));
    const detections = deduplicated.map(row => {
      const score = Math.round(row.score * 1000) / 1000;
      return {
        boundingBox: {
          x: Math.round(row.left / sample.width * 1e6) / 1e6,
          y: Math.round(row.top / sample.height * 1e6) / 1e6,
          width: Math.round(row.width / sample.width * 1e6) / 1e6,
          height: Math.round(row.height / sample.height * 1e6) / 1e6
        },
        detectionConfidence: score >= 0.78 ? "high" : score >= 0.66 ? "medium" : "low",
        detectionScore: score,
        observationSource: "automatic",
        row: row.row,
        column: row.column,
        detectionSignals: {
          ...row.signals,
          smallCardRegion: row.signals.areaRatio < 0.018,
          strongRotation: Number(row.signals.rotationDegrees) > 12,
          possiblePerspective: row.signals.edgeBalance < 0.28,
          candidateSource: row.candidateSource
        }
      };
    }).filter(row => normalizedBoundingBox(row.boundingBox));
    return {
      detections,
      photoQuality,
      parameters: { iouThreshold: Number(options.iouThreshold || 0.45), minimumScore, maxDimension: options.maxDimension || 480 }
    };
  }

  async function detectCollectionCardsFromDataUrl(imageDataUrl, options = {}) {
    const image = await loadImage(imageDataUrl);
    const maxCanvasDimension = Math.max(480, Number(options.maxCanvasDimension || 1600));
    const scale = Math.min(1, maxCanvasDimension / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    return { ...detectCollectionCardsFromRgba(pixels.data, pixels.width, pixels.height, options), imageWidth: image.naturalWidth, imageHeight: image.naturalHeight };
  }

  function evaluateCollectionDetections(expected = [], detected = [], iouThreshold = 0.50) {
    const expectedBoxes = expected.map(row => normalizedBoundingBox(row?.boundingBox || row)).filter(Boolean);
    const detectedBoxes = detected.map(row => normalizedBoundingBox(row?.boundingBox || row)).filter(Boolean);
    const pairs = [];
    expectedBoxes.forEach((expectedBox, expectedIndex) => detectedBoxes.forEach((detectedBox, detectedIndex) => pairs.push({ expectedIndex, detectedIndex, iou: boundingBoxIoU(expectedBox, detectedBox) })));
    pairs.sort((left, right) => right.iou - left.iou);
    const usedExpected = new Set();
    const usedDetected = new Set();
    const matches = [];
    for (const pair of pairs) {
      if (pair.iou < iouThreshold || usedExpected.has(pair.expectedIndex) || usedDetected.has(pair.detectedIndex)) continue;
      usedExpected.add(pair.expectedIndex);usedDetected.add(pair.detectedIndex);matches.push(pair);
    }
    const truePositives = matches.length;
    const falsePositives = detectedBoxes.length - truePositives;
    const falseNegatives = expectedBoxes.length - truePositives;
    const precision = detectedBoxes.length ? truePositives / detectedBoxes.length : expectedBoxes.length ? 0 : 1;
    const recall = expectedBoxes.length ? truePositives / expectedBoxes.length : detectedBoxes.length ? 0 : 1;
    return {
      expectedCards: expectedBoxes.length,
      detectedCards: detectedBoxes.length,
      truePositives,
      falsePositives,
      falseNegatives,
      matches,
      meanIoU: matches.length ? matches.reduce((sum, row) => sum + row.iou, 0) / matches.length : 0,
      precision,
      recall,
      f1: precision + recall ? 2 * precision * recall / (precision + recall) : 0,
      iouThreshold
    };
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
    boundingBoxIoU,
    fallbackBounds,
    detectCardBoundsFromRgba,
    candidateBoundsFromRgba,
    detectCollectionCardsFromRgba,
    detectCollectionCardsFromDataUrl,
    evaluateCollectionDetections,
    regionRect,
    prepareRecognitionPayload
  });
});
