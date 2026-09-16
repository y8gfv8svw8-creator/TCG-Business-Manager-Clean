(function initializeScannerImageProcessing(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.TcgScannerImageProcessing = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createScannerImageProcessing() {
  "use strict";

  const CARD_ASPECT = 0.68;
  const REGION_LAYOUTS = Object.freeze({
    title: { x: 0.025, y: 0.050, width: 0.91, height: 0.145, targetHeight: 220 },
    titleHigh: { x: 0.020, y: 0.005, width: 0.92, height: 0.145, targetHeight: 220 },
    titleLower: { x: 0.020, y: 0.105, width: 0.92, height: 0.145, targetHeight: 220 },
    titleWide: { x: 0.010, y: 0.020, width: 0.96, height: 0.300, targetHeight: 260 },
    setCode: { x: 0.664, y: 0.6614, width: 0.222, height: 0.0369, targetHeight: 100 },
    footer: { x: 0.014, y: 0.920, width: 0.359, height: 0.037, targetHeight: 100 },
    passcode: { x: 0.012, y: 0.862, width: 0.62, height: 0.118, targetHeight: 180 },
    artwork: { x: 0.10, y: 0.18, width: 0.80, height: 0.48, targetHeight: 420 },
    artworkWide: { x: 0.065, y: 0.145, width: 0.87, height: 0.545, targetHeight: 420 }
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

  function normalizedQuadrilateral(value) {
    if (!Array.isArray(value) || value.length !== 4) return null;
    const points = value.map(point => ({ x: Number(point?.x), y: Number(point?.y) }));
    if (points.some(point => !Number.isFinite(point.x) || !Number.isFinite(point.y)
      || point.x < 0 || point.y < 0 || point.x > 1.000001 || point.y > 1.000001)) return null;
    return polygonArea(points) > 0.000001 ? points : null;
  }

  function quadrilateralBoundingBox(value) {
    const points = normalizedQuadrilateral(value);
    if (!points) return null;
    const minX = Math.min(...points.map(point => point.x));
    const minY = Math.min(...points.map(point => point.y));
    const maxX = Math.max(...points.map(point => point.x));
    const maxY = Math.max(...points.map(point => point.y));
    return normalizedBoundingBox({ x: minX, y: minY, width: maxX - minX, height: maxY - minY });
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

  function boundingBoxOverlap(left, right) {
    const expected = normalizedBoundingBox(left?.boundingBox || left);
    const detected = normalizedBoundingBox(right?.boundingBox || right);
    if (!expected || !detected) return { iou: 0, coverage: 0, detectedCoverage: 0, areaRatio: 0 };
    const x0 = Math.max(expected.x, detected.x);
    const y0 = Math.max(expected.y, detected.y);
    const x1 = Math.min(expected.x + expected.width, detected.x + detected.width);
    const y1 = Math.min(expected.y + expected.height, detected.y + detected.height);
    const intersection = Math.max(0, x1 - x0) * Math.max(0, y1 - y0);
    const expectedArea = expected.width * expected.height;
    const detectedArea = detected.width * detected.height;
    const union = expectedArea + detectedArea - intersection;
    return {
      iou: union > 0 ? intersection / union : 0,
      coverage: expectedArea > 0 ? intersection / expectedArea : 0,
      detectedCoverage: detectedArea > 0 ? intersection / detectedArea : 0,
      areaRatio: expectedArea > 0 ? detectedArea / expectedArea : 0
    };
  }

  function normalizeRotationDegrees(value) {
    let angle = Number(value || 0);
    while (angle <= -90) angle += 180;
    while (angle > 90) angle -= 180;
    return angle;
  }

  function orientedRectCorners(rect) {
    if (!rect || ![rect.centerX, rect.centerY, rect.width, rect.height, rect.rotationDegrees].every(value => Number.isFinite(Number(value)))) return [];
    const angle = Number(rect.rotationDegrees) * Math.PI / 180;
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    return [
      [-rect.width / 2, -rect.height / 2],
      [rect.width / 2, -rect.height / 2],
      [rect.width / 2, rect.height / 2],
      [-rect.width / 2, rect.height / 2]
    ].map(([x, y]) => ({
      x: rect.centerX + x * cosine - y * sine,
      y: rect.centerY + x * sine + y * cosine
    }));
  }

  function polygonSignedArea(points) {
    if (!Array.isArray(points) || points.length < 3) return 0;
    let total = 0;
    for (let index = 0; index < points.length; index += 1) {
      const current = points[index];
      const next = points[(index + 1) % points.length];
      total += current.x * next.y - next.x * current.y;
    }
    return total / 2;
  }

  function polygonArea(points) {
    return Math.abs(polygonSignedArea(points));
  }

  function lineIntersection(start, end, clipStart, clipEnd) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const clipDx = clipEnd.x - clipStart.x;
    const clipDy = clipEnd.y - clipStart.y;
    const denominator = dx * clipDy - dy * clipDx;
    if (Math.abs(denominator) < 1e-9) return { ...end };
    const ratio = ((clipStart.x - start.x) * clipDy - (clipStart.y - start.y) * clipDx) / denominator;
    return { x: start.x + ratio * dx, y: start.y + ratio * dy };
  }

  function intersectConvexPolygons(subject, clip) {
    if (!Array.isArray(subject) || subject.length < 3 || !Array.isArray(clip) || clip.length < 3) return [];
    let output = subject.map(point => ({ x: Number(point.x), y: Number(point.y) }));
    const orientation = polygonSignedArea(clip) >= 0 ? 1 : -1;
    const inside = (point, start, end) => orientation * ((end.x - start.x) * (point.y - start.y) - (end.y - start.y) * (point.x - start.x)) >= -1e-7;
    for (let clipIndex = 0; clipIndex < clip.length && output.length; clipIndex += 1) {
      const clipStart = clip[clipIndex];
      const clipEnd = clip[(clipIndex + 1) % clip.length];
      const input = output;
      output = [];
      let start = input[input.length - 1];
      for (const end of input) {
        const endInside = inside(end, clipStart, clipEnd);
        const startInside = inside(start, clipStart, clipEnd);
        if (endInside) {
          if (!startInside) output.push(lineIntersection(start, end, clipStart, clipEnd));
          output.push(end);
        } else if (startInside) output.push(lineIntersection(start, end, clipStart, clipEnd));
        start = end;
      }
    }
    return output;
  }

  function polygonIoU(left, right) {
    if (!Array.isArray(left) || !Array.isArray(right)) return 0;
    const leftArea = polygonArea(left);
    const rightArea = polygonArea(right);
    const intersection = polygonArea(intersectConvexPolygons(left, right));
    const union = leftArea + rightArea - intersection;
    return union > 0 ? clamp(intersection / union, 0, 1) : 0;
  }

  function axisAlignedCorners(rect) {
    return [
      { x: rect.left, y: rect.top },
      { x: rect.left + rect.width, y: rect.top },
      { x: rect.left + rect.width, y: rect.top + rect.height },
      { x: rect.left, y: rect.top + rect.height }
    ];
  }

  function candidateCorners(candidate) {
    return Array.isArray(candidate?.quadrilateral) && candidate.quadrilateral.length === 4
      ? candidate.quadrilateral : axisAlignedCorners(candidate);
  }

  function candidatePolygonIoU(left, right) {
    return polygonIoU(candidateCorners(left), candidateCorners(right));
  }

  function orientedRectFromPoints(points, meanX, meanY, covarianceX, covarianceY, covarianceXY) {
    if (!Array.isArray(points) || points.length < 16) return null;
    const axisAngle = 0.5 * Math.atan2(2 * covarianceXY, covarianceX - covarianceY);
    let majorX = Math.cos(axisAngle);
    let majorY = Math.sin(axisAngle);
    let minorX = -majorY;
    let minorY = majorX;
    let minMajor = Infinity;let maxMajor = -Infinity;let minMinor = Infinity;let maxMinor = -Infinity;
    for (let index = 0; index < points.length; index += 2) {
      const dx = points[index] - meanX;
      const dy = points[index + 1] - meanY;
      const major = dx * majorX + dy * majorY;
      const minor = dx * minorX + dy * minorY;
      minMajor = Math.min(minMajor, major);maxMajor = Math.max(maxMajor, major);
      minMinor = Math.min(minMinor, minor);maxMinor = Math.max(maxMinor, minor);
    }
    let majorExtent = maxMajor - minMajor + 1;
    let minorExtent = maxMinor - minMinor + 1;
    if (majorExtent < minorExtent) {
      [majorExtent, minorExtent] = [minorExtent, majorExtent];
      [majorX, minorX] = [minorX, majorX];
      [majorY, minorY] = [minorY, majorY];
      [minMajor, minMinor] = [minMinor, minMajor];
      [maxMajor, maxMinor] = [maxMinor, maxMajor];
    }
    if (minorExtent < 8 || majorExtent < 12) return null;
    const centerMajor = (minMajor + maxMajor) / 2;
    const centerMinor = (minMinor + maxMinor) / 2;
    const centerX = meanX + centerMajor * majorX + centerMinor * minorX;
    const centerY = meanY + centerMajor * majorY + centerMinor * minorY;
    const rotationDegrees = normalizeRotationDegrees(Math.atan2(majorY, majorX) * 180 / Math.PI - 90);
    return { centerX, centerY, width: minorExtent, height: majorExtent, rotationDegrees };
  }

  function downsampleRgba(data, width, height, maxDimension = 480) {
    const scale = Math.min(1, maxDimension / Math.max(width, height));
    const targetWidth = Math.max(24, Math.round(width * scale));
    const targetHeight = Math.max(24, Math.round(height * scale));
    const gray = new Float32Array(targetWidth * targetHeight);
    const red = new Uint8Array(targetWidth * targetHeight);
    const green = new Uint8Array(targetWidth * targetHeight);
    const blue = new Uint8Array(targetWidth * targetHeight);
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
        red[index] = data[offset];green[index] = data[offset + 1];blue[index] = data[offset + 2];
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
      red,
      green,
      blue,
      width: targetWidth,
      height: targetHeight,
      scale,
      brightness: mean,
      contrast: Math.sqrt(Math.max(0, sumSquares / count - mean * mean)),
      darkRatio: dark / count,
      overexposedRatio: bright / count
    };
  }

  function gradientAnalysis(gray, width, height, colors = null) {
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
        const lumaX = Math.abs(gray[index + 1] - gray[index - 1]);
        const lumaY = Math.abs(gray[index + width] - gray[index - width]);
        const colorX = colors ? Math.hypot(
          colors.red[index + 1] - colors.red[index - 1],
          colors.green[index + 1] - colors.green[index - 1],
          colors.blue[index + 1] - colors.blue[index - 1]
        ) / Math.sqrt(3) : 0;
        const colorY = colors ? Math.hypot(
          colors.red[index + width] - colors.red[index - width],
          colors.green[index + width] - colors.green[index - width],
          colors.blue[index + width] - colors.blue[index - width]
        ) / Math.sqrt(3) : 0;
        const gx = Math.max(lumaX, colorX * 0.88);
        const gy = Math.max(lumaY, colorY * 0.88);
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

  function gradientOrientationSignals(gradients) {
    const bins = new Array(6).fill(0);
    let strongEdges = 0;
    for (let index = 0; index < gradients.magnitude.length; index += 1) {
      if (gradients.magnitude[index] < gradients.threshold) continue;
      const gx = gradients.gradientX[index];
      const gy = gradients.gradientY[index];
      if (gx + gy <= 0) continue;
      const angle = Math.atan2(gy, gx) * 180 / Math.PI;
      bins[Math.min(bins.length - 1, Math.floor(angle / 15))] += 1;
      strongEdges += 1;
    }
    if (!strongEdges) return { strongEdges: 0, axialRatio: 0, diagonalRatio: 0, orientationEntropy: 0, bins };
    let entropy = 0;
    for (const count of bins) {
      const probability = count / strongEdges;
      if (probability > 0) entropy -= probability * Math.log(probability);
    }
    return {
      strongEdges,
      axialRatio: (bins[0] + bins[5]) / strongEdges,
      diagonalRatio: (bins[2] + bins[3]) / strongEdges,
      orientationEntropy: entropy / Math.log(bins.length),
      bins
    };
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

  function binaryEdgeComponents(gradients, width, height, thresholdScale = 1) {
    const strong = new Uint8Array(width * height);
    const componentThreshold = gradients.threshold * clamp(Number(thresholdScale || 1), 0.72, 1.45);
    for (let index = 0; index < strong.length; index += 1) strong[index] = gradients.magnitude[index] >= componentThreshold ? 1 : 0;
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
      const edgePoints = [];
      while (stack.length) {
        const index = stack.pop();
        const x = index % width;
        const y = Math.floor(index / width);
        minX = Math.min(minX, x);maxX = Math.max(maxX, x);minY = Math.min(minY, y);maxY = Math.max(maxY, y);pixels += 1;
        if (strong[index]) { edgePixels += 1;sumX += x;sumY += y;sumXX += x * x;sumYY += y * y;sumXY += x * y;edgePoints.push(x, y); }
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
      const orientedRect = orientedRectFromPoints(edgePoints, meanX, meanY, covarianceX, covarianceY, covarianceXY);
      components.push({ left: minX, top: minY, width: componentWidth, height: componentHeight, pixels, edgePixels, rotation, orientedRect, thresholdScale });
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
      let minX = width;let minY = height;let maxX = 0;let maxY = 0;let pixels = 0;let foregroundPixels = 0;let sumX = 0;let sumY = 0;let sumXX = 0;let sumYY = 0;let sumXY = 0;const foregroundPoints = [];
      while (stack.length) {
        const index = stack.pop();const x = index % width;const y = Math.floor(index / width);
        minX = Math.min(minX, x);maxX = Math.max(maxX, x);minY = Math.min(minY, y);maxY = Math.max(maxY, y);pixels += 1;
        if (mask[index]) { foregroundPixels += 1;sumX += x;sumY += y;sumXX += x * x;sumYY += y * y;sumXY += x * y;foregroundPoints.push(x, y); }
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
      const orientedRect = orientedRectFromPoints(foregroundPoints, meanX, meanY, covarianceX, covarianceY, covarianceXY);
      components.push({ left: minX, top: minY, width: componentWidth, height: componentHeight, fillRatio: foregroundPixels / Math.max(1, area), rotation, orientedRect });
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

  function pixelValue(values, width, height, x, y) {
    const safeX = clamp(Math.round(x), 0, width - 1);
    const safeY = clamp(Math.round(y), 0, height - 1);
    return values[safeY * width + safeX];
  }

  function orientedEdgeEvidence(rect, context) {
    const { width, height, gradients } = context;
    const angle = rect.rotationDegrees * Math.PI / 180;
    const ux = Math.cos(angle);const uy = Math.sin(angle);
    const vx = -Math.sin(angle);const vy = Math.cos(angle);
    const band = Math.max(1, Math.round(Math.min(rect.width, rect.height) * 0.025));
    const samples = 28;
    const sides = [];
    const intensities = [];
    const sampleSide = (baseU, baseV, directionX, directionY, alongX, alongY, length) => {
      let supported = 0;let intensity = 0;
      for (let step = 0; step < samples; step += 1) {
        const along = ((step + 0.5) / samples - 0.5) * length;
        const baseX = rect.centerX + baseU * ux + baseV * vx + along * alongX;
        const baseY = rect.centerY + baseU * uy + baseV * vy + along * alongY;
        let strongest = 0;
        for (let offset = -band; offset <= band; offset += 1) {
          const x = baseX + directionX * offset;
          const y = baseY + directionY * offset;
          if (x < 1 || y < 1 || x >= width - 1 || y >= height - 1) continue;
          strongest = Math.max(strongest, pixelValue(gradients.magnitude, width, height, x, y));
        }
        intensity += strongest;
        if (strongest >= gradients.threshold * 0.46) supported += 1;
      }
      sides.push(supported / samples);intensities.push(intensity / samples);
    };
    sampleSide(-rect.width / 2, 0, ux, uy, vx, vy, rect.height * 0.91);
    sampleSide(rect.width / 2, 0, ux, uy, vx, vy, rect.height * 0.91);
    sampleSide(0, -rect.height / 2, vx, vy, ux, uy, rect.width * 0.90);
    sampleSide(0, rect.height / 2, vx, vy, ux, uy, rect.width * 0.90);
    return {
      value: sides.reduce((sum, value) => sum + value, 0) / sides.length,
      sides,
      intensity: intensities.reduce((sum, value) => sum + value, 0) / intensities.length
    };
  }

  function orientedBoundaryContrast(rect, context) {
    const { width, height, sampleGray } = context;
    const angle = rect.rotationDegrees * Math.PI / 180;
    const ux = Math.cos(angle);const uy = Math.sin(angle);
    const vx = -Math.sin(angle);const vy = Math.cos(angle);
    const distance = Math.max(2, Math.min(rect.width, rect.height) * 0.035);
    const samples = 18;
    let total = 0;let count = 0;
    const compareSide = (baseU, baseV, normalX, normalY, alongX, alongY, length) => {
      for (let step = 0; step < samples; step += 1) {
        const along = ((step + 0.5) / samples - 0.5) * length;
        const baseX = rect.centerX + baseU * ux + baseV * vx + along * alongX;
        const baseY = rect.centerY + baseU * uy + baseV * vy + along * alongY;
        const insideX = baseX - normalX * distance;
        const insideY = baseY - normalY * distance;
        const outsideX = baseX + normalX * distance;
        const outsideY = baseY + normalY * distance;
        if ([insideX, outsideX].some(value => value < 1 || value >= width - 1)
          || [insideY, outsideY].some(value => value < 1 || value >= height - 1)) continue;
        total += Math.abs(pixelValue(sampleGray, width, height, insideX, insideY) - pixelValue(sampleGray, width, height, outsideX, outsideY));
        count += 1;
      }
    };
    compareSide(-rect.width / 2, 0, -ux, -uy, vx, vy, rect.height * 0.82);
    compareSide(rect.width / 2, 0, ux, uy, vx, vy, rect.height * 0.82);
    compareSide(0, -rect.height / 2, -vx, -vy, ux, uy, rect.width * 0.82);
    compareSide(0, rect.height / 2, vx, vy, ux, uy, rect.width * 0.82);
    return clamp((total / Math.max(1, count)) / Math.max(12, context.sampleContrast * 0.58), 0, 1);
  }

  function scoreOrientedCardRectangle(orientedRect, context, componentStrength = 0) {
    if (!orientedRect) return null;
    const rect = { ...orientedRect, rotationDegrees: normalizeRotationDegrees(orientedRect.rotationDegrees) };
    const corners = orientedRectCorners(rect);
    if (corners.length !== 4 || corners.some(point => point.x < -2 || point.y < -2 || point.x > context.width + 2 || point.y > context.height + 2)) return null;
    const aspect = rect.width / Math.max(1, rect.height);
    const areaRatio = rect.width * rect.height / Math.max(1, context.width * context.height);
    if (aspect < 0.48 || aspect > 0.87 || areaRatio < 0.006 || areaRatio > 0.42) return null;
    const evidence = orientedEdgeEvidence(rect, context);
    const contrast = orientedBoundaryContrast(rect, context);
    const strongSideCount = evidence.sides.filter(value => value >= 0.34).length;
    if (strongSideCount < 3 || evidence.value < 0.34 || (contrast < 0.12 && evidence.value < 0.52)) return null;
    const orderedSides = [...evidence.sides].sort((left, right) => left - right);
    const edgeBalance = orderedSides[0] / Math.max(0.001, orderedSides[3]);
    const edgeStrength = clamp((evidence.intensity - context.gradients.mean * 0.75) / Math.max(8, context.gradients.threshold * 0.58), 0, 1);
    const aspectScore = clamp(1 - Math.abs(aspect - CARD_ASPECT) / 0.22, 0, 1);
    const areaScore = clamp(areaRatio / 0.025, 0.30, 1);
    const score = clamp(edgeStrength * 0.20 + evidence.value * 0.30 + edgeBalance * 0.08
      + aspectScore * 0.20 + contrast * 0.14 + areaScore * 0.03 + componentStrength * 0.05, 0, 1);
    if (score < 0.43) return null;
    const minX = Math.min(...corners.map(point => point.x));
    const minY = Math.min(...corners.map(point => point.y));
    const maxX = Math.max(...corners.map(point => point.x));
    const maxY = Math.max(...corners.map(point => point.y));
    return {
      left: clamp(minX, 0, context.width),
      top: clamp(minY, 0, context.height),
      width: clamp(maxX, 0, context.width) - clamp(minX, 0, context.width),
      height: clamp(maxY, 0, context.height) - clamp(minY, 0, context.height),
      score,
      candidateSource: "oriented_component",
      quadrilateral: corners,
      orientedRect: rect,
      signals: {
        edgeStrength: Math.round(edgeStrength * 1000) / 1000,
        edgeContinuity: Math.round(evidence.value * 1000) / 1000,
        edgeBalance: Math.round(edgeBalance * 1000) / 1000,
        aspectRatio: Math.round(aspect * 1000) / 1000,
        aspectScore: Math.round(aspectScore * 1000) / 1000,
        boundaryContrast: Math.round(contrast * 1000) / 1000,
        outerBoundaryScore: Math.round(clamp(evidence.value * 0.52 + edgeBalance * 0.18 + contrast * 0.30, 0, 1) * 1000) / 1000,
        areaRatio: Math.round(areaRatio * 10000) / 10000,
        rotationDegrees: Math.round(rect.rotationDegrees * 10) / 10,
        sideContinuity: evidence.sides.map(value => Math.round(value * 1000) / 1000),
        orientedGeometry: true
      }
    };
  }

  function boundaryContrast(rect, context) {
    const { integralGray, integralRed, integralGreen, integralBlue, sampleContrast } = context;
    const bandX = Math.max(2, Math.round(rect.width * 0.025));
    const bandY = Math.max(2, Math.round(rect.height * 0.018));
    const trimX = Math.max(2, Math.round(rect.width * 0.08));
    const trimY = Math.max(2, Math.round(rect.height * 0.08));
    const grayDifferences = [
      Math.abs(regionMean(integralGray, rect.left - bandX * 2, rect.top + trimY, bandX, rect.height - trimY * 2)
        - regionMean(integralGray, rect.left + bandX, rect.top + trimY, bandX, rect.height - trimY * 2)),
      Math.abs(regionMean(integralGray, rect.left + rect.width + bandX, rect.top + trimY, bandX, rect.height - trimY * 2)
        - regionMean(integralGray, rect.left + rect.width - bandX * 2, rect.top + trimY, bandX, rect.height - trimY * 2)),
      Math.abs(regionMean(integralGray, rect.left + trimX, rect.top - bandY * 2, rect.width - trimX * 2, bandY)
        - regionMean(integralGray, rect.left + trimX, rect.top + bandY, rect.width - trimX * 2, bandY)),
      Math.abs(regionMean(integralGray, rect.left + trimX, rect.top + rect.height + bandY, rect.width - trimX * 2, bandY)
        - regionMean(integralGray, rect.left + trimX, rect.top + rect.height - bandY * 2, rect.width - trimX * 2, bandY))
    ];
    const colorDistance = (leftRect, rightRect) => {
      const color = source => Math.hypot(
        regionMean(integralRed, ...source) - regionMean(integralRed, ...rightRect),
        regionMean(integralGreen, ...source) - regionMean(integralGreen, ...rightRect),
        regionMean(integralBlue, ...source) - regionMean(integralBlue, ...rightRect)
      ) / Math.sqrt(3);
      return color(leftRect);
    };
    const colorDifferences = [
      colorDistance([rect.left - bandX * 2, rect.top + trimY, bandX, rect.height - trimY * 2], [rect.left + bandX, rect.top + trimY, bandX, rect.height - trimY * 2]),
      colorDistance([rect.left + rect.width + bandX, rect.top + trimY, bandX, rect.height - trimY * 2], [rect.left + rect.width - bandX * 2, rect.top + trimY, bandX, rect.height - trimY * 2]),
      colorDistance([rect.left + trimX, rect.top - bandY * 2, rect.width - trimX * 2, bandY], [rect.left + trimX, rect.top + bandY, rect.width - trimX * 2, bandY]),
      colorDistance([rect.left + trimX, rect.top + rect.height + bandY, rect.width - trimX * 2, bandY], [rect.left + trimX, rect.top + rect.height - bandY * 2, rect.width - trimX * 2, bandY])
    ];
    const grayAverage = grayDifferences.reduce((sum, value) => sum + value, 0) / grayDifferences.length;
    const colorAverage = colorDifferences.reduce((sum, value) => sum + value, 0) / colorDifferences.length;
    return Math.max(
      clamp(grayAverage / Math.max(14, sampleContrast * 0.62), 0, 1),
      clamp(colorAverage / 36, 0, 1)
    );
  }

  function scoreCardRectangle(rect, context, componentStrength = 0, rotation = null) {
    const { width, height, gradients, integralX, integralY } = context;
    if (rect.left < 0 || rect.top < 0 || rect.left + rect.width > width || rect.top + rect.height > height) return null;
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
    const contrast = boundaryContrast(rect, context);
    const strongSideCount = continuity.sides.filter(value => value >= 0.35).length;
    const strongComponent = componentStrength >= 0.65;
    if ((!componentStrength && (strongSideCount < 2 || continuity.value < 0.28 || (strongSideCount < 3 && contrast < 0.42)))
      || (componentStrength && !strongComponent && (strongSideCount < 3 || continuity.value < 0.38))
      || (strongComponent && (continuity.value < 0.18 || (edgeStrength < 0.08 && edgeBalance < 0.20)))) return null;
    const aspectScore = clamp(1 - Math.abs(aspect - CARD_ASPECT) / 0.25, 0, 1);
    const areaScore = clamp(areaRatio / 0.025, 0.35, 1);
    const score = clamp(edgeStrength * 0.25 + continuity.value * 0.24 + edgeBalance * 0.10
      + aspectScore * 0.18 + contrast * 0.14 + areaScore * 0.04 + componentStrength * 0.05, 0, 1);
    const outerBoundaryScore = clamp(continuity.value * 0.48 + edgeBalance * 0.20 + contrast * 0.32, 0, 1);
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
        boundaryContrast: Math.round(contrast * 1000) / 1000,
        outerBoundaryScore: Math.round(outerBoundaryScore * 1000) / 1000,
        areaRatio: Math.round(areaRatio * 10000) / 10000,
        rotationDegrees: rotation == null ? null : Math.round(rotation * 10) / 10,
        sideContinuity: continuity.sides.map(value => Math.round(value * 1000) / 1000)
      }
    };
  }

  function scorePerspectiveCardRectangle(rect, context) {
    const { width, height, gradients, integralX, integralY } = context;
    if (rect.left < 0 || rect.top < 0 || rect.left + rect.width > width || rect.top + rect.height > height) return null;
    const aspect = rect.width / Math.max(1, rect.height);
    const areaRatio = rect.width * rect.height / Math.max(1, width * height);
    if (aspect < 0.48 || aspect > 0.94 || areaRatio < 0.075 || areaRatio > 0.30) return null;
    const band = Math.max(3, Math.round(Math.min(rect.width, rect.height) * 0.06));
    const trimX = Math.max(2, Math.round(rect.width * 0.06));
    const trimY = Math.max(2, Math.round(rect.height * 0.06));
    const sides = [
      regionMean(integralX, rect.left - band, rect.top + trimY, band * 2 + 1, rect.height - trimY * 2),
      regionMean(integralX, rect.left + rect.width - band - 1, rect.top + trimY, band * 2 + 1, rect.height - trimY * 2),
      regionMean(integralY, rect.left + trimX, rect.top - band, rect.width - trimX * 2, band * 2 + 1),
      regionMean(integralY, rect.left + trimX, rect.top + rect.height - band - 1, rect.width - trimX * 2, band * 2 + 1)
    ];
    const continuity = edgeContinuity(rect, gradients, width, height, band);
    const strongSideCount = continuity.sides.filter(value => value >= 0.34).length;
    const contrast = boundaryContrast(rect, context);
    if (strongSideCount < 2 || continuity.value < 0.30 || (strongSideCount < 3 && contrast < 0.28)) return null;
    const orderedSides = [...sides].sort((left, right) => left - right);
    const robustSideBalance = clamp(orderedSides[1] / Math.max(1, orderedSides[3]), 0, 1);
    const sideAverage = sides.reduce((sum, value) => sum + value, 0) / 4;
    const edgeStrength = clamp((sideAverage - gradients.mean * 0.72) / Math.max(8, gradients.threshold * 0.50), 0, 1);
    const aspectScore = clamp(1 - Math.abs(aspect - CARD_ASPECT) / 0.28, 0, 1);
    const score = clamp(edgeStrength * 0.20 + continuity.value * 0.30 + robustSideBalance * 0.12
      + aspectScore * 0.16 + contrast * 0.17 + Math.min(1, areaRatio / 0.13) * 0.05, 0, 1);
    const outerBoundaryScore = clamp(continuity.value * 0.55 + robustSideBalance * 0.20 + contrast * 0.25, 0, 1);
    if (score < 0.42 || outerBoundaryScore < 0.38) return null;
    return {
      ...rect,
      score,
      candidateSource: "perspective_window",
      signals: {
        edgeStrength: Math.round(edgeStrength * 1000) / 1000,
        edgeContinuity: Math.round(continuity.value * 1000) / 1000,
        edgeBalance: Math.round(robustSideBalance * 1000) / 1000,
        aspectRatio: Math.round(aspect * 1000) / 1000,
        aspectScore: Math.round(aspectScore * 1000) / 1000,
        boundaryContrast: Math.round(contrast * 1000) / 1000,
        outerBoundaryScore: Math.round(outerBoundaryScore * 1000) / 1000,
        areaRatio: Math.round(areaRatio * 10000) / 10000,
        rotationDegrees: null,
        sideContinuity: continuity.sides.map(value => Math.round(value * 1000) / 1000),
        perspectiveCorridor: true
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

  function candidateGeometryQuality(candidate) {
    return clamp(Number(candidate?.score || 0) * 0.34
      + Number(candidate?.signals?.outerBoundaryScore || 0) * 0.30
      + Number(candidate?.signals?.edgeContinuity || 0) * 0.22
      + Number(candidate?.signals?.aspectScore || 0) * 0.14, 0, 1);
  }

  function spatialRepresentatives(candidates) {
    const representatives = [];
    [...candidates].sort((left, right) => candidateGeometryQuality(right) - candidateGeometryQuality(left)).forEach(candidate => {
      const centerX = candidate.left + candidate.width / 2;
      const centerY = candidate.top + candidate.height / 2;
      const duplicate = representatives.some(existing => {
        const averageWidth = (candidate.width + existing.width) / 2;
        const averageHeight = (candidate.height + existing.height) / 2;
        const dx = Math.abs(centerX - existing.left - existing.width / 2) / Math.max(1, averageWidth);
        const dy = Math.abs(centerY - existing.top - existing.height / 2) / Math.max(1, averageHeight);
        return rectIntersectionRatio(candidate, existing) >= 0.30 || (dx < 0.72 && dy < 0.72);
      });
      if (!duplicate) representatives.push(candidate);
    });
    return representatives;
  }

  function deriveDynamicLocalCardModels(candidates, context) {
    const eligible = candidates.filter(candidate => candidate.score >= 0.45
      && candidate.signals.aspectScore >= 0.44
      && candidate.signals.outerBoundaryScore >= 0.48
      && candidate.signals.edgeContinuity >= 0.40
      && candidate.signals.areaRatio >= 0.007
      && candidate.signals.areaRatio <= 0.32
      && (candidate.candidateSource !== "window_scan" || candidate.signals.localCardFieldSupport === true))
      .sort((left, right) => candidateGeometryQuality(right) - candidateGeometryQuality(left))
      .slice(0, 220);
    if (eligible.length < 3) return [];
    const median = values => [...values].sort((left, right) => left - right)[Math.floor(values.length / 2)] || 0;
    const models = [];
    for (const seed of eligible) {
      const comparable = eligible.filter(candidate => {
        const widthRatio = candidate.width / Math.max(1, seed.width);
        const heightRatio = candidate.height / Math.max(1, seed.height);
        return widthRatio >= 0.72 && widthRatio <= 1.38 && heightRatio >= 0.72 && heightRatio <= 1.38;
      });
      const representatives = spatialRepresentatives(comparable);
      if (representatives.length < 3) continue;
      const width = median(representatives.map(candidate => candidate.width));
      const height = median(representatives.map(candidate => candidate.height));
      const area = median(representatives.map(candidate => candidate.width * candidate.height));
      if (!width || !height || !area) continue;
      const quality = representatives.reduce((sum, candidate) => sum + candidateGeometryQuality(candidate), 0) / representatives.length;
      const localFieldSupport = spatialRepresentatives(comparable.filter(candidate => {
        const widthRatio = candidate.width / Math.max(1, width);
        const heightRatio = candidate.height / Math.max(1, height);
        return candidate.signals.localCardFieldSupport === true
          && widthRatio >= 0.82 && widthRatio <= 1.22 && heightRatio >= 0.82 && heightRatio <= 1.22;
      })).length;
      const windowSupport = representatives.filter(candidate => candidate.candidateSource === "window_scan").length;
      const minLeft = Math.min(...representatives.map(candidate => candidate.left));
      const minTop = Math.min(...representatives.map(candidate => candidate.top));
      const maxRight = Math.max(...representatives.map(candidate => candidate.left + candidate.width));
      const maxBottom = Math.max(...representatives.map(candidate => candidate.top + candidate.height));
      const layoutCoverage = (maxRight - minLeft) * (maxBottom - minTop) / Math.max(1, context.width * context.height);
      const candidateModel = { width, height, area, representatives, support: representatives.length, localFieldSupport,
        windowSupport, layoutCoverage, quality };
      const duplicateModelIndex = models.findIndex(model => {
        const widthRatio = width / Math.max(1, model.width);
        const heightRatio = height / Math.max(1, model.height);
        return widthRatio >= 0.88 && widthRatio <= 1.14 && heightRatio >= 0.88 && heightRatio <= 1.14;
      });
      if (duplicateModelIndex < 0) models.push(candidateModel);
      else if (candidateModel.support > models[duplicateModelIndex].support
        || (candidateModel.support === models[duplicateModelIndex].support
          && candidateModel.quality > models[duplicateModelIndex].quality)) models[duplicateModelIndex] = candidateModel;
    }
    const localFieldRepresentatives = spatialRepresentatives(candidates.filter(candidate => candidate.signals.localCardFieldSupport === true));
    if (localFieldRepresentatives.length >= 3) {
      const width = median(localFieldRepresentatives.map(candidate => candidate.width));
      const height = median(localFieldRepresentatives.map(candidate => candidate.height));
      const area = median(localFieldRepresentatives.map(candidate => candidate.width * candidate.height));
      const minLeft = Math.min(...localFieldRepresentatives.map(candidate => candidate.left));
      const minTop = Math.min(...localFieldRepresentatives.map(candidate => candidate.top));
      const maxRight = Math.max(...localFieldRepresentatives.map(candidate => candidate.left + candidate.width));
      const maxBottom = Math.max(...localFieldRepresentatives.map(candidate => candidate.top + candidate.height));
      const localFieldModel = {
        width,
        height,
        area,
        representatives: localFieldRepresentatives,
        support: localFieldRepresentatives.length,
        localFieldSupport: localFieldRepresentatives.length,
        windowSupport: localFieldRepresentatives.length,
        layoutCoverage: (maxRight - minLeft) * (maxBottom - minTop) / Math.max(1, context.width * context.height),
        quality: localFieldRepresentatives.reduce((sum, candidate) => sum + candidateGeometryQuality(candidate), 0) / localFieldRepresentatives.length
      };
      const duplicateModel = models.some(model => {
        const widthRatio = width / Math.max(1, model.width);
        const heightRatio = height / Math.max(1, model.height);
        return widthRatio >= 0.88 && widthRatio <= 1.14 && heightRatio >= 0.88 && heightRatio <= 1.14;
      });
      if (!duplicateModel) models.push(localFieldModel);
    }
    for (const model of models) {
      const smallerModels = models.filter(other => other.area <= model.area / 1.65 && other.support >= 3);
      model.multiContainerCount = model.representatives.filter(candidate => smallerModels.some(smaller => {
        const contained = smaller.representatives.filter(inner => rectContainment(inner, candidate) >= 0.78);
        if (contained.length < 2) return false;
        const minX = Math.min(...contained.map(inner => inner.left + inner.width / 2));
        const maxX = Math.max(...contained.map(inner => inner.left + inner.width / 2));
        const minY = Math.min(...contained.map(inner => inner.top + inner.height / 2));
        const maxY = Math.max(...contained.map(inner => inner.top + inner.height / 2));
        return maxX - minX >= smaller.width * 0.52 || maxY - minY >= smaller.height * 0.52;
      })).length;
      model.effectiveSupport = model.support - model.multiContainerCount * 1.25;
    }
    return models.sort((left, right) => right.effectiveSupport - left.effectiveSupport
      || right.support - left.support || right.area - left.area || right.quality - left.quality);
  }

  function recoverDynamicLayoutCandidates(candidates, model, context) {
    if (!model || model.localFieldSupport < 3 || model.support < 4 || model.layoutCoverage < 0.30) return null;
    const anchors = spatialRepresentatives(candidates.filter(candidate => candidate.signals.localCardFieldSupport === true
      && !candidate.signals.multiCardBoxLikely
      && candidate.width / Math.max(1, model.width) >= 0.76
      && candidate.width / Math.max(1, model.width) <= 1.24
      && candidate.height / Math.max(1, model.height) >= 0.76
      && candidate.height / Math.max(1, model.height) <= 1.24
      && candidate.signals.outerBoundaryScore >= 0.50
      && candidate.signals.edgeContinuity >= 0.40
      && candidateGeometryQuality(candidate) >= 0.58));
    if (anchors.length < 4) return null;
    const cluster = (axis, dimension, tolerance) => {
      const groups = [];
      [...anchors].sort((left, right) => (left[axis] + left[dimension] / 2) - (right[axis] + right[dimension] / 2)).forEach(candidate => {
        const center = candidate[axis] + candidate[dimension] / 2;
        let group = groups.find(row => Math.abs(row.center - center) <= tolerance);
        if (!group) { group = { center, items: [] };groups.push(group); }
        group.items.push(candidate);
        group.center = group.items.reduce((sum, row) => sum + row[axis] + row[dimension] / 2, 0) / group.items.length;
      });
      return groups;
    };
    const rows = cluster("top", "height", model.height * 0.48);
    const columns = cluster("left", "width", model.width * 0.48);
    if (rows.filter(group => group.items.length >= 2).length < 2
      || columns.filter(group => group.items.length >= 2).length < 2) return null;
    const possiblePositions = rows.length * columns.length;
    if (possiblePositions < anchors.length || possiblePositions > anchors.length * 1.60) return null;
    const median = values => [...values].sort((left, right) => left - right)[Math.floor(values.length / 2)] || 0;
    const regression = (items, input, output, fallback) => {
      if (items.length < 2) return () => fallback;
      const inputMean = items.reduce((sum, row) => sum + input(row), 0) / items.length;
      const outputMean = items.reduce((sum, row) => sum + output(row), 0) / items.length;
      const variance = items.reduce((sum, row) => sum + (input(row) - inputMean) ** 2, 0);
      if (variance < 1) return () => outputMean;
      const slope = items.reduce((sum, row) => sum + (input(row) - inputMean) * (output(row) - outputMean), 0) / variance;
      return value => outputMean + slope * (value - inputMean);
    };
    const centerX = candidate => candidate.left + candidate.width / 2;
    const centerY = candidate => candidate.top + candidate.height / 2;
    const recovered = [];
    for (const row of rows) for (const column of columns) {
      const columnX = regression(column.items, centerY, centerX, column.center);
      const rowY = regression(row.items, centerX, centerY, row.center);
      let predictedX = columnX(row.center);
      let predictedY = rowY(predictedX);
      predictedX = columnX(predictedY);
      const occupied = anchors.some(candidate => Math.abs(centerX(candidate) - predictedX) <= model.width * 0.62
        && Math.abs(centerY(candidate) - predictedY) <= model.height * 0.62);
      if (occupied) continue;
      const typicalWidth = median(row.items.map(candidate => candidate.width)) || model.width;
      const typicalHeight = median(row.items.map(candidate => candidate.height)) || model.height;
      let best = null;
      for (const scale of [0.90, 1, 1.10]) for (const offsetX of [-0.12, 0, 0.12]) for (const offsetY of [-0.12, 0, 0.12]) {
        const width = Math.round(typicalWidth * scale);
        const height = Math.round(typicalHeight * scale);
        const rect = boundedRect({
          left: Math.round(predictedX - width / 2 + typicalWidth * offsetX),
          top: Math.round(predictedY - height / 2 + typicalHeight * offsetY),
          width,
          height
        }, context.width, context.height);
        if (rect.width < width * 0.96 || rect.height < height * 0.96) continue;
        const scored = scoreCardRectangle(rect, context);
        if (!scored || scored.signals.outerBoundaryScore < 0.52 || scored.signals.edgeContinuity < 0.38
          || candidateGeometryQuality(scored) < 0.52) continue;
        if (!best || candidateGeometryQuality(scored) > candidateGeometryQuality(best)) best = scored;
      }
      if (!best) continue;
      recovered.push({
        ...best,
        candidateSource: "dynamic_layout_recovery",
        score: clamp(best.score + 0.20, 0, 1),
        signals: { ...best.signals, dynamicLayoutSupport: true, dynamicLayoutRecovered: true,
          localCardModelSupport: model.support, multiCardBoxLikely: false, multiCardBoxScore: 0 }
      });
    }
    return { anchors, recovered, rows: rows.length, columns: columns.length };
  }

  function applyDynamicCardGeometry(candidates, context) {
    const models = deriveDynamicLocalCardModels(candidates, context);
    const model = models[0];
    if (!model) return { candidates: candidates.map(candidate => ({
      ...candidate,
      signals: { ...candidate.signals, multiCardBoxLikely: false, multiCardBoxScore: 0 }
    })), model: null };
    const members = new Set(model.representatives);
    const calibrated = candidates.map(candidate => {
      const area = candidate.width * candidate.height;
      const areaRatio = area / Math.max(1, model.area);
      const widthRatio = candidate.width / Math.max(1, model.width);
      const heightRatio = candidate.height / Math.max(1, model.height);
      const contained = model.representatives.filter(inner => inner !== candidate
        && inner.width * inner.height <= area * 0.68
        && rectContainment(inner, candidate) >= 0.78);
      let separated = false;
      if (contained.length >= 2) {
        const minX = Math.min(...contained.map(inner => inner.left + inner.width / 2));
        const maxX = Math.max(...contained.map(inner => inner.left + inner.width / 2));
        const minY = Math.min(...contained.map(inner => inner.top + inner.height / 2));
        const maxY = Math.max(...contained.map(inner => inner.top + inner.height / 2));
        separated = maxX - minX >= model.width * 0.52 || maxY - minY >= model.height * 0.52;
      }
      const clearlyLarger = areaRatio >= 1.65 && (widthRatio >= 1.34 || heightRatio >= 1.34);
      const likely = !members.has(candidate) && clearlyLarger && contained.length >= 2 && separated;
      const multiCardScore = likely ? clamp(0.52 + Math.min(0.22, (areaRatio - 1.65) * 0.08)
        + Math.min(0.18, (contained.length - 1) * 0.06) + Math.min(0.08, Math.max(widthRatio, heightRatio) * 0.025), 0, 1) : 0;
      const dynamicLayoutSupport = members.has(candidate) && model.support >= 4;
      return {
        ...candidate,
        score: likely ? Math.min(candidate.score, 0.49) : dynamicLayoutSupport ? clamp(candidate.score + 0.22, 0, 1) : candidate.score,
        signals: {
          ...candidate.signals,
          dynamicLayoutSupport,
          localCardModelSupport: model.support,
          localCardAreaRatio: Math.round(areaRatio * 1000) / 1000,
          containedCardStructures: contained.length,
          multiCardBoxLikely: likely,
          multiCardBoxScore: Math.round(multiCardScore * 1000) / 1000
        }
      };
    });
    const localModel = models.filter(candidateModel => candidateModel.localFieldSupport >= 3
      && candidateModel.support >= 4
      && candidateModel.layoutCoverage >= 0.30
      && (candidateModel === model || model.area >= candidateModel.area * 1.35))
      .sort((left, right) => right.localFieldSupport - left.localFieldSupport
        || right.quality - left.quality || right.support - left.support || left.area - right.area)[0];
    const localLayout = localModel ? recoverDynamicLayoutCandidates(calibrated, localModel, context) : null;
    if (localLayout) {
      const anchorSet = new Set(localLayout.anchors);
      const locallyCalibrated = calibrated.map(candidate => {
        const area = candidate.width * candidate.height;
        const areaRatio = area / Math.max(1, localModel.area);
        const widthRatio = candidate.width / Math.max(1, localModel.width);
        const heightRatio = candidate.height / Math.max(1, localModel.height);
        const contained = localLayout.anchors.filter(inner => inner !== candidate
          && inner.width * inner.height <= area * 0.68
          && rectContainment(inner, candidate) >= 0.78);
        let separated = false;
        if (contained.length >= 2) {
          const minX = Math.min(...contained.map(inner => inner.left + inner.width / 2));
          const maxX = Math.max(...contained.map(inner => inner.left + inner.width / 2));
          const minY = Math.min(...contained.map(inner => inner.top + inner.height / 2));
          const maxY = Math.max(...contained.map(inner => inner.top + inner.height / 2));
          separated = maxX - minX >= localModel.width * 0.52 || maxY - minY >= localModel.height * 0.52;
        }
        const localMultiCardBox = !anchorSet.has(candidate) && areaRatio >= 1.65
          && (widthRatio >= 1.34 || heightRatio >= 1.34) && contained.length >= 2 && separated;
        const multiCardBoxLikely = candidate.signals.multiCardBoxLikely || localMultiCardBox;
        const dynamicLayoutSupport = anchorSet.has(candidate);
        const multiCardBoxScore = localMultiCardBox ? clamp(0.52 + Math.min(0.22, (areaRatio - 1.65) * 0.08)
          + Math.min(0.18, (contained.length - 1) * 0.06), 0, 1) : Number(candidate.signals.multiCardBoxScore || 0);
        return {
          ...candidate,
          score: multiCardBoxLikely ? Math.min(candidate.score, 0.49)
            : dynamicLayoutSupport ? clamp(candidate.score + 0.22, 0, 1) : candidate.score,
          signals: {
            ...candidate.signals,
            dynamicLayoutSupport,
            dynamicLayoutRecovered: false,
            localCardModelSupport: localModel.support,
            localCardAreaRatio: Math.round(areaRatio * 1000) / 1000,
            containedCardStructures: Math.max(Number(candidate.signals.containedCardStructures || 0), contained.length),
            multiCardBoxLikely,
            multiCardBoxScore: Math.round(multiCardBoxScore * 1000) / 1000
          }
        };
      });
      return {
        candidates: [...locallyCalibrated, ...localLayout.recovered],
        model: {
          width: localModel.width,
          height: localModel.height,
          area: localModel.area,
          support: localModel.support,
          localFieldSupport: localModel.localFieldSupport,
          windowSupport: localModel.windowSupport,
          layoutCoverage: Math.round(localModel.layoutCoverage * 1000) / 1000,
          quality: Math.round(localModel.quality * 1000) / 1000,
          recovered: localLayout.recovered.length
        }
      };
    }
    return {
      candidates: calibrated,
      model: {
        width: model.width,
        height: model.height,
        area: model.area,
        support: model.support,
        localFieldSupport: model.localFieldSupport,
        windowSupport: model.windowSupport,
        layoutCoverage: Math.round(model.layoutCoverage * 1000) / 1000,
        quality: Math.round(model.quality * 1000) / 1000
      }
    };
  }

  function isAnchoredOuterCandidate(candidate) {
    return (candidate.candidateSource === "edge_component" || candidate.candidateSource === "contrast_component")
      && candidate.signals.areaRatio <= 0.30
      && candidate.signals.outerBoundaryScore >= 0.75
      && candidate.signals.edgeBalance >= 0.45;
  }

  function deduplicateRectangles(candidates, iouThreshold = 0.45) {
    const priority = candidate => {
      return candidate.score + (isAnchoredOuterCandidate(candidate) ? 0.24 : 0);
    };
    const sorted = [...candidates].sort((left, right) => priority(right) - priority(left)
      || right.score - left.score || right.width * right.height - left.width * left.height);
    const kept = [];
    for (const candidate of sorted) {
      let rejected = false;
      for (let index = kept.length - 1; index >= 0; index -= 1) {
        const existing = kept[index];
        const candidateArea = candidate.width * candidate.height;
        const existingArea = existing.width * existing.height;
        const overlap = candidatePolygonIoU(candidate, existing);
        const candidateRotation = Number(candidate.signals?.rotationDegrees || 0);
        const existingRotation = Number(existing.signals?.rotationDegrees || 0);
        const rotationDifference = Math.abs(normalizeRotationDegrees(candidateRotation - existingRotation));
        const plausiblyDistinctOverlap = candidate.signals?.orientedGeometry && existing.signals?.orientedGeometry
          && rotationDifference >= 12 && overlap < 0.78;
        if (overlap >= iouThreshold && !plausiblyDistinctOverlap) { rejected = true;break; }
        if (isAnchoredOuterCandidate(existing)
          && candidateArea <= existingArea * 1.25
          && rectContainment(candidate, existing) >= 0.28) { rejected = true;break; }
        if (isAnchoredOuterCandidate(existing)
          && !isAnchoredOuterCandidate(candidate)
          && candidateArea > existingArea
          && rectContainment(existing, candidate) >= 0.55) { rejected = true;break; }
        const candidateInside = candidateArea < existingArea * 0.78 && rectContainment(candidate, existing) >= 0.86;
        if (candidateInside && existing.score >= candidate.score - 0.08) { rejected = true;break; }
        const existingInside = existingArea < candidateArea * 0.78 && rectContainment(existing, candidate) >= 0.86;
        if (existingInside && candidate.score >= existing.score - 0.05) kept.splice(index, 1);
      }
      const containedHigherScored = kept.filter(existing => existing.score >= candidate.score
        && existing.width * existing.height < candidate.width * candidate.height * 0.72
        && rectContainment(existing, candidate) >= 0.78);
      if (containedHigherScored.length >= 2) rejected = true;
      if (rejected) continue;
      kept.push(candidate);
    }
    return kept;
  }

  function suppressGroupRectangles(candidates) {
    if (!Array.isArray(candidates) || candidates.length < 3) return candidates;
    const areas = candidates.map(candidate => candidate.orientedRect
      ? candidate.orientedRect.width * candidate.orientedRect.height : candidate.width * candidate.height)
      .sort((left, right) => left - right);
    const medianArea = areas[Math.floor(areas.length / 2)] || 1;
    return candidates.filter(candidate => {
      const area = candidate.orientedRect ? candidate.orientedRect.width * candidate.orientedRect.height : candidate.width * candidate.height;
      if (area < medianArea * 1.65) return true;
      const containedCards = candidates.filter(other => {
        if (other === candidate) return false;
        const otherArea = other.orientedRect ? other.orientedRect.width * other.orientedRect.height : other.width * other.height;
        if (otherArea > area * 0.72) return false;
        const centerX = other.left + other.width / 2;
        const centerY = other.top + other.height / 2;
        return centerX >= candidate.left && centerX <= candidate.left + candidate.width
          && centerY >= candidate.top && centerY <= candidate.top + candidate.height;
      }).length;
      return containedCards < 2;
    });
  }

  function clusterLooseAxisFallbacks(candidates) {
    if (!Array.isArray(candidates) || candidates.length < 2) return candidates;
    const pending = [...candidates].sort((left, right) => right.score - left.score);
    const clusters = [];
    while (pending.length) {
      const seed = pending.shift();
      const cluster = [seed];
      let changed = true;
      while (changed) {
        changed = false;
        for (let index = pending.length - 1; index >= 0; index -= 1) {
          const candidate = pending[index];
          const connected = cluster.some(existing => {
            const averageWidth = (candidate.width + existing.width) / 2;
            const averageHeight = (candidate.height + existing.height) / 2;
            const dx = Math.abs(candidate.left + candidate.width / 2 - existing.left - existing.width / 2);
            const dy = Math.abs(candidate.top + candidate.height / 2 - existing.top - existing.height / 2);
            return rectIntersectionRatio(candidate, existing) >= 0.055
              || (dx <= averageWidth * 0.72 && dy <= averageHeight * 0.72);
          });
          if (connected) { cluster.push(candidate);pending.splice(index, 1);changed = true; }
        }
      }
      clusters.push(cluster);
    }
    return clusters.map(cluster => cluster.sort((left, right) => {
      const leftPriority = left.score + left.signals.outerBoundaryScore * 0.18 + left.signals.edgeBalance * 0.08;
      const rightPriority = right.score + right.signals.outerBoundaryScore * 0.18 + right.signals.edgeBalance * 0.08;
      return rightPriority - leftPriority;
    })[0]);
  }

  function boostLooseCardField(candidates, context) {
    if (!Array.isArray(candidates) || candidates.length < 4) return candidates;
    const localSeeds = deduplicateRectangles(candidates.filter(candidate => candidate.candidateSource === "window_scan"
      && candidate.signals.areaRatio >= 0.025
      && candidate.signals.areaRatio <= 0.10
      && candidate.signals.outerBoundaryScore >= 0.78
      && candidate.signals.edgeContinuity >= 0.74
      && candidate.signals.aspectScore >= 0.44), 0.42);
    if (localSeeds.length < 4) return candidates;
    const heights = localSeeds.map(candidate => candidate.height).sort((left, right) => left - right);
    const medianHeight = heights[Math.floor(heights.length / 2)] || 1;
    const replacements = new Map(localSeeds.map(candidate => {
      let supported = candidate;
      if (candidate.height >= medianHeight * 0.70 && candidate.height < medianHeight * 0.90) {
        const width = Math.round(medianHeight * CARD_ASPECT);
        const expanded = boundedRect({
          left: Math.round(candidate.left + candidate.width / 2 - width / 2),
          top: Math.round(candidate.top + candidate.height / 2 - medianHeight / 2),
          width,
          height: medianHeight
        }, context.width, context.height);
        const rescored = scoreCardRectangle(expanded, context);
        if (rescored) supported = { ...rescored, candidateSource: candidate.candidateSource };
      }
      return [candidate, {
        ...supported,
        score: Math.max(supported.score, 0.64),
        signals: { ...supported.signals, localCardFieldSupport: true }
      }];
    }));
    return candidates.map(candidate => replacements.get(candidate) || candidate);
  }

  function recalibrateCandidateScales(candidates) {
    const eligible = candidates.filter(row => row.score >= 0.48
      && row.signals.aspectScore >= 0.42
      && row.signals.areaRatio >= 0.012
      && row.signals.areaRatio <= 0.38);
    if (eligible.length < 2) return candidates;
    const scaleRows = eligible.map(candidate => {
      const representatives = [];
      const comparable = eligible.filter(other => {
        const widthRatio = other.width / Math.max(1, candidate.width);
        const heightRatio = other.height / Math.max(1, candidate.height);
        return widthRatio >= 0.78 && widthRatio <= 1.28 && heightRatio >= 0.78 && heightRatio <= 1.28;
      }).sort((left, right) => right.score - left.score);
      comparable.forEach(other => {
        const centerX = other.left + other.width / 2;
        const centerY = other.top + other.height / 2;
        const duplicatePosition = representatives.some(existing => {
          const dx = Math.abs(centerX - existing.left - existing.width / 2) / Math.max(other.width, existing.width);
          const dy = Math.abs(centerY - existing.top - existing.height / 2) / Math.max(other.height, existing.height);
          return (dx < 0.58 && dy < 0.58) || rectIntersectionRatio(other, existing) >= 0.24;
        });
        if (!duplicatePosition) representatives.push(other);
      });
      const count = representatives.length;
      const coherence = Math.min(count, 4) - Math.max(0, count - 6) * 0.22;
      return { candidate, count, rank: coherence + Math.sqrt(candidate.signals.areaRatio) * 0.7 + candidate.score * 0.35 };
    });
    const maximumRepeatedCount = Math.max(...scaleRows.map(row => row.count));
    const repeatedOuterScales = scaleRows.filter(row => row.count >= 3 && row.count >= maximumRepeatedCount * 0.50)
      .sort((left, right) => right.candidate.signals.areaRatio - left.candidate.signals.areaRatio || right.rank - left.rank);
    const dominant = repeatedOuterScales[0]
      || [...scaleRows].sort((left, right) => right.rank - left.rank || right.candidate.signals.areaRatio - left.candidate.signals.areaRatio)[0];
    if (!dominant || dominant.count < 2) return candidates;
    const dominantArea = dominant.candidate.width * dominant.candidate.height;
    return candidates.map(candidate => {
      const area = candidate.width * candidate.height;
      const deviation = Math.abs(Math.log(Math.max(1, area) / Math.max(1, dominantArea)));
      const relativeSizeSupport = clamp(1 - deviation / 0.72, 0, 1);
      const innerScalePenalty = area < dominantArea * 0.56 ? 0.24 : 0;
      const outerScalePenalty = area > dominantArea * 2.1 ? 0.08 : 0;
      const score = clamp(candidate.score + relativeSizeSupport * 0.15 - innerScalePenalty - outerScalePenalty, 0, 1);
      return {
        ...candidate,
        score,
        signals: {
          ...candidate.signals,
          relativeSizeSupport: Math.round(relativeSizeSupport * 1000) / 1000,
          repeatedSizeCount: dominant.count,
          innerScalePenalty: innerScalePenalty > 0
        }
      };
    });
  }

  function boostOuterContainment(candidates) {
    return candidates.map(candidate => {
      const candidateArea = candidate.width * candidate.height;
      if (candidate.signals.areaRatio < 0.035) return candidate;
      const nested = candidates.filter(inner => {
        if (inner === candidate || inner.score < 0.40) return false;
        const innerArea = inner.width * inner.height;
        if (innerArea < candidateArea * 0.06 || innerArea > candidateArea * 0.66) return false;
        const centerX = inner.left + inner.width / 2;
        const centerY = inner.top + inner.height / 2;
        const marginX = candidate.width * 0.04;
        const marginY = candidate.height * 0.04;
        return centerX >= candidate.left + marginX && centerX <= candidate.left + candidate.width - marginX
          && centerY >= candidate.top + marginY && centerY <= candidate.top + candidate.height - marginY;
      }).sort((left, right) => right.score - left.score);
      const representatives = [];
      nested.forEach(inner => {
        const duplicate = representatives.some(existing => rectIntersectionRatio(inner, existing) >= 0.34
          || (Math.abs(inner.left + inner.width / 2 - existing.left - existing.width / 2) < candidate.width * 0.10
            && Math.abs(inner.top + inner.height / 2 - existing.top - existing.height / 2) < candidate.height * 0.10));
        if (!duplicate) representatives.push(inner);
      });
      const support = Math.min(3, representatives.length);
      if (!support) return candidate;
      return {
        ...candidate,
        score: clamp(candidate.score + support * 0.065, 0, 1),
        signals: { ...candidate.signals, nestedInteriorSupport: support }
      };
    });
  }

  function expandedOuterCandidates(candidates, context) {
    const { width, height } = context;
    const seeds = deduplicateRectangles(candidates.filter(row => row.score >= 0.45
      && row.signals.areaRatio >= 0.008
      && row.signals.areaRatio <= 0.16), 0.62).slice(0, 80);
    const expanded = [];
    for (const seed of seeds) {
      const centerX = seed.left + seed.width / 2;
      for (const scale of [1.35, 1.55, 1.80, 2.05, 2.30, 2.60, 3.00, 3.50, 4.00]) {
        const candidateHeight = Math.round(seed.height * scale);
        const candidateWidth = Math.round(candidateHeight * CARD_ASPECT);
        if (candidateHeight < 28 || candidateHeight >= height * 0.72 || candidateWidth >= width * 0.62) continue;
        for (const verticalCenter of [0.43, 0.50, 0.57]) {
          for (const horizontalOffset of [-0.06, 0, 0.06]) {
            const left = Math.round(centerX - candidateWidth / 2 + candidateWidth * horizontalOffset);
            const top = Math.round(seed.top + seed.height / 2 - candidateHeight * verticalCenter);
            const bounded = boundedRect({ left, top, width: candidateWidth, height: candidateHeight }, width, height);
            if (bounded.width < candidateWidth * 0.84 || bounded.height < candidateHeight * 0.84) continue;
            const scored = scoreCardRectangle(bounded, context);
            if (!scored || scored.signals.outerBoundaryScore < 0.35 || scored.signals.boundaryContrast < 0.18 || scored.score < 0.35) continue;
            scored.candidateSource = "outer_expansion";
            scored.score = clamp(scored.score + scored.signals.outerBoundaryScore * 0.06, 0, 1);
            scored.signals.expandedFromInnerCandidate = true;
            expanded.push(scored);
          }
        }
      }
    }
    return expanded;
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

  function analyzeCollectionScene(detections = [], photoQuality = {}, analysisSignals = {}) {
    const rows = Array.isArray(detections) ? detections : [];
    const count = rows.length;
    const orientationSignals = analysisSignals?.orientationSignals || {};
    const imageAxialRatio = clamp(Number(orientationSignals.axialRatio || 0), 0, 1);
    const imageDiagonalRatio = clamp(Number(orientationSignals.diagonalRatio || 0), 0, 1);
    const orientationEntropy = clamp(Number(orientationSignals.orientationEntropy || 0), 0, 1);
    const angles = rows.map(row => Math.abs(normalizeRotationDegrees(Number(row.detectionSignals?.rotationDegrees || 0))));
    const rotatedCount = angles.filter(angle => angle >= 10).length;
    const stronglyRotatedCount = angles.filter(angle => angle >= 28).length;
    const gridCount = rows.filter(row => row.row && row.column).length;
    const areas = rows.map(row => Number(row.boundingBox?.width || 0) * Number(row.boundingBox?.height || 0)).filter(value => value > 0).sort((left, right) => left - right);
    const medianArea = areas.length ? areas[Math.floor(areas.length / 2)] : 0;
    const sizeVariation = medianArea ? areas.reduce((sum, area) => sum + Math.abs(area - medianArea) / medianArea, 0) / areas.length : 0;
    let overlapPairs = 0;
    for (let left = 0; left < rows.length; left += 1) for (let right = left + 1; right < rows.length; right += 1) {
      if (boundingBoxIoU(rows[left], rows[right]) >= 0.035) overlapPairs += 1;
    }
    const possiblePairs = count > 1 ? count * (count - 1) / 2 : 0;
    const overlapRatio = possiblePairs ? overlapPairs / possiblePairs : 0;
    const lowConfidenceCount = rows.filter(row => row.detectionConfidence === "low").length;
    const gridRatio = count ? gridCount / count : 0;
    const rotationRatio = count ? rotatedCount / count : 0;
    let binderScore = count >= 4 ? clamp(gridRatio * 0.58 + (1 - clamp(sizeVariation, 0, 1)) * 0.24 + (1 - rotationRatio) * 0.18, 0, 1) : 0;
    if (imageDiagonalRatio >= 0.30 && imageAxialRatio < 0.50) binderScore *= 0.55;
    const looseScore = count ? clamp((count <= 3 ? 0.30 : 0) + rotationRatio * 0.38
      + clamp(sizeVariation, 0, 1) * 0.18 + clamp(overlapRatio * 3, 0, 1) * 0.24
      + clamp(imageDiagonalRatio * 0.50 + Math.max(0, 0.48 - imageAxialRatio) * 0.35, 0, 0.28), 0, 1) : 0;
    let sceneType = "mixed_or_uncertain";
    if (binderScore >= 0.68 && looseScore < 0.46) sceneType = "binder_grid";
    else if (binderScore >= 0.42 && looseScore >= 0.42 && Math.abs(binderScore - looseScore) < 0.18) sceneType = "mixed_or_uncertain";
    else if (looseScore >= 0.42 || (count > 0 && count <= 3 && gridCount === 0)) sceneType = "loose_cards";
    const confidenceScore = sceneType === "mixed_or_uncertain"
      ? clamp(0.30 + Math.abs(binderScore - looseScore) * 0.25, 0, 0.58)
      : clamp(0.50 + Math.abs(binderScore - looseScore) * 0.55, 0, 0.96);
    const imageRotationComplexity = imageDiagonalRatio >= 0.36 ? 0.42 : imageDiagonalRatio >= 0.28 ? 0.16 : 0;
    const imageDisorderComplexity = orientationEntropy >= 0.96 && imageAxialRatio < 0.48 ? 0.18 : 0;
    const complexityScore = clamp(rotationRatio * 0.28 + (count ? stronglyRotatedCount / count : 0) * 0.18
      + clamp(sizeVariation, 0, 1) * 0.20 + clamp(overlapRatio * 4, 0, 1) * 0.22
      + (count ? lowConfidenceCount / count : 0) * 0.08 + (count >= 12 ? 0.08 : 0)
      + imageRotationComplexity + imageDisorderComplexity, 0, 1);
    const complexitySignals = [];
    if (rotatedCount) complexitySignals.push("rotated_cards");
    if (stronglyRotatedCount) complexitySignals.push("strong_rotation");
    if (sizeVariation >= 0.24) complexitySignals.push("varied_card_sizes");
    if (overlapPairs) complexitySignals.push("overlapping_regions");
    if (lowConfidenceCount) complexitySignals.push("uncertain_boundaries");
    if (count >= 12) complexitySignals.push("many_visible_cards");
    if (imageRotationComplexity) complexitySignals.push("rotation_rich_image");
    if (imageDisorderComplexity) complexitySignals.push("orientation_disorder");
    return {
      sceneType,
      sceneConfidence: confidenceScore >= 0.78 ? "high" : confidenceScore >= 0.55 ? "medium" : "low",
      sceneConfidenceScore: Math.round(confidenceScore * 1000) / 1000,
      sceneSignals: {
        detectionCount: count,
        gridRatio: Math.round(gridRatio * 1000) / 1000,
        rotationRatio: Math.round(rotationRatio * 1000) / 1000,
        stronglyRotatedCount,
        sizeVariation: Math.round(sizeVariation * 1000) / 1000,
        overlapPairs,
        overlapRatio: Math.round(overlapRatio * 1000) / 1000,
        imageAxialRatio: Math.round(imageAxialRatio * 1000) / 1000,
        imageDiagonalRatio: Math.round(imageDiagonalRatio * 1000) / 1000,
        orientationEntropy: Math.round(orientationEntropy * 1000) / 1000,
        binderScore: Math.round(binderScore * 1000) / 1000,
        looseScore: Math.round(looseScore * 1000) / 1000,
        imageWarnings: Array.isArray(photoQuality?.warnings) ? photoQuality.warnings.length : 0
      },
      sceneComplexity: {
        level: complexityScore >= 0.58 ? "high" : complexityScore >= 0.28 ? "medium" : "low",
        score: Math.round(complexityScore * 1000) / 1000,
        signals: complexitySignals
      }
    };
  }

  function detectCollectionCardsFromRgba(data, width, height, options = {}) {
    if (!data || width < 40 || height < 40) {
      const photoQuality = { warnings: ["image_too_small"] };
      return { detections: [], photoQuality, sceneAnalysis: analyzeCollectionScene([], photoQuality), parameters: { iouThreshold: 0.45, detectorMode: "rotation_aware_loose_cards" } };
    }
    const sample = downsampleRgba(data, width, height, options.maxDimension || 480);
    const gradients = gradientAnalysis(sample.gray, sample.width, sample.height, sample);
    const orientationSignals = gradientOrientationSignals(gradients);
    const photoQuality = imageQualityFromAnalysis(sample, gradients);
    if (photoQuality.warnings.includes("low_contrast") && gradients.mean < 0.75 && sample.contrast < 8) return {
      detections: [], photoQuality, sceneAnalysis: analyzeCollectionScene([], photoQuality),
      parameters: { iouThreshold: 0.45, minimumScore: 0.60, detectorMode: "rotation_aware_loose_cards" }
    };
    const integralX = integralImage(gradients.gradientX, sample.width, sample.height);
    const integralY = integralImage(gradients.gradientY, sample.width, sample.height);
    const integralGray = integralImage(sample.gray, sample.width, sample.height);
    const integralRed = integralImage(sample.red, sample.width, sample.height);
    const integralGreen = integralImage(sample.green, sample.width, sample.height);
    const integralBlue = integralImage(sample.blue, sample.width, sample.height);
    const context = { width: sample.width, height: sample.height, gradients, integralX, integralY, integralGray, integralRed, integralGreen, integralBlue, sampleGray: sample.gray, sampleContrast: sample.contrast };
    const candidates = [];
    const orientedCandidates = [];
    for (const component of foregroundComponents(sample)) {
      const scored = scoreCardRectangle(component, context, clamp(component.fillRatio * 1.8, 0, 1), component.rotation);
      if (scored && scored.score >= 0.44) { scored.candidateSource = "contrast_component";candidates.push(scored); }
      const oriented = scoreOrientedCardRectangle(component.orientedRect, context, clamp(component.fillRatio * 1.5, 0, 1));
      if (oriented && Math.abs(oriented.signals.rotationDegrees) >= 7) { oriented.candidateSource = "oriented_contrast_component";orientedCandidates.push(oriented); }
    }
    for (const thresholdScale of [0.82, 1, 1.22]) for (const component of binaryEdgeComponents(gradients, sample.width, sample.height, thresholdScale)) {
      const perimeter = Math.max(1, 2 * (component.width + component.height));
      const strength = clamp(component.edgePixels / perimeter, 0, 1);
      const scored = thresholdScale === 1 ? scoreCardRectangle(component, context, strength, component.rotation) : null;
      if (scored && scored.score >= 0.42) candidates.push(scored);
      const oriented = scoreOrientedCardRectangle(component.orientedRect, context, strength);
      if (oriented && Math.abs(oriented.signals.rotationDegrees) >= 7) {
        oriented.candidateSource = "oriented_edge_component";
        oriented.signals.edgeThresholdScale = thresholdScale;
        orientedCandidates.push(oriented);
      }
    }
    const heightRatios = options.heightRatios || [0.16, 0.20, 0.24, 0.29, 0.34, 0.39, 0.44, 0.50, 0.57, 0.65, 0.74, 0.84];
    for (const heightRatio of heightRatios) {
      const candidateHeight = Math.round(sample.height * heightRatio);
      if (candidateHeight < 26) continue;
      for (const aspect of [0.60, 0.68, 0.76]) {
        const candidateWidth = Math.round(candidateHeight * aspect);
        if (candidateWidth < 18 || candidateWidth >= sample.width - 4) continue;
        const stepX = Math.max(3, Math.round(candidateWidth * 0.085));
        const stepY = Math.max(3, Math.round(candidateHeight * 0.075));
        const band = Math.max(1, Math.round(Math.min(candidateWidth, candidateHeight) * 0.025));
        for (let top = 0; top + candidateHeight <= sample.height; top += stepY) {
          for (let left = 0; left + candidateWidth <= sample.width; left += stepX) {
            const vertical = (regionMean(integralX, left - band, top, band * 2 + 1, candidateHeight) + regionMean(integralX, left + candidateWidth - band - 1, top, band * 2 + 1, candidateHeight)) / 2;
            const horizontal = (regionMean(integralY, left, top - band, candidateWidth, band * 2 + 1) + regionMean(integralY, left, top + candidateHeight - band - 1, candidateWidth, band * 2 + 1)) / 2;
            if (Math.min(vertical, horizontal) < Math.max(gradients.mean * 1.05, gradients.threshold * 0.10)) continue;
            const scored = scoreCardRectangle({ left, top, width: candidateWidth, height: candidateHeight }, context);
            if (scored && scored.score >= 0.40) candidates.push(scored);
          }
        }
      }
    }
    // A second, deliberately large-card-only pass tolerates slanted binder
    // sleeves and perspective by evaluating a corridor around the proposed
    // outer border. It contributes candidates only; layout evidence may boost
    // them later but never invents a card rectangle on its own.
    if (sample.height / Math.max(1, sample.width) >= 1.12) for (const heightRatio of [0.36, 0.41, 0.46, 0.51, 0.56]) {
      const candidateHeight = Math.round(sample.height * heightRatio);
      for (const aspect of [0.62, 0.70, 0.78, 0.86]) {
        const candidateWidth = Math.round(candidateHeight * aspect);
        if (candidateWidth < 24 || candidateWidth >= sample.width - 2) continue;
        const stepX = Math.max(5, Math.round(candidateWidth * 0.085));
        const stepY = Math.max(5, Math.round(candidateHeight * 0.065));
        for (let top = 0; top + candidateHeight <= sample.height; top += stepY) {
          for (let left = 0; left + candidateWidth <= sample.width; left += stepX) {
            const scored = scorePerspectiveCardRectangle({ left, top, width: candidateWidth, height: candidateHeight }, context);
            if (scored) candidates.push(scored);
          }
        }
      }
    }
    candidates.push(...expandedOuterCandidates(candidates, context));
    const minimumScore = clamp(Number(options.minimumScore ?? 0.60), 0.45, 0.95);
    const dynamicGeometry = applyDynamicCardGeometry(boostLooseCardField(
      recalibrateCandidateScales(boostOuterContainment(candidates)), context), context);
    const calibratedCandidates = dynamicGeometry.candidates;
    const rejectedMultiCardCandidates = deduplicateRectangles(calibratedCandidates.filter(row => row.signals.multiCardBoxLikely), 0.48)
      .sort((left, right) => right.signals.multiCardBoxScore - left.signals.multiCardBoxScore || right.score - left.score)
      .slice(0, 16);
    const plausibleCalibratedCandidates = calibratedCandidates.filter(row => !row.signals.multiCardBoxLikely);
    const dynamicLayoutCandidates = plausibleCalibratedCandidates.filter(row => row.signals.dynamicLayoutSupport);
    const localFieldCandidates = plausibleCalibratedCandidates.filter(row => row.signals.localCardFieldSupport);
    const localFieldAreas = localFieldCandidates.map(row => row.width * row.height).sort((left, right) => left - right);
    const localFieldMedianArea = localFieldAreas.length ? localFieldAreas[Math.floor(localFieldAreas.length / 2)] : 0;
    const baseConsideredCandidates = dynamicLayoutCandidates.length >= 4 ? dynamicLayoutCandidates : plausibleCalibratedCandidates;
    const protectedDynamicLayout = dynamicLayoutCandidates.length >= 4
      && orientationSignals.axialRatio >= 0.48
      && orientationSignals.diagonalRatio <= 0.29;
    const consideredCandidates = !protectedDynamicLayout && localFieldCandidates.length >= 4 ? baseConsideredCandidates.filter(row => {
      if (row.signals.localCardFieldSupport) return true;
      const rowArea = row.width * row.height;
      const containedLocalCards = localFieldCandidates.filter(local => {
        if (local.width * local.height >= rowArea * 0.82) return false;
        const centerX = local.left + local.width / 2;
        const centerY = local.top + local.height / 2;
        return centerX >= row.left && centerX <= row.left + row.width
          && centerY >= row.top && centerY <= row.top + row.height;
      }).length;
      return containedLocalCards < 2;
    }) : baseConsideredCandidates;
    const anchoredOuterCandidates = [];
    consideredCandidates.filter(isAnchoredOuterCandidate)
      .sort((left, right) => right.score - left.score)
      .forEach(candidate => {
        const centerX = candidate.left + candidate.width / 2;
        const centerY = candidate.top + candidate.height / 2;
        const samePhysicalRegion = anchoredOuterCandidates.some(existing => {
          const averageWidth = (candidate.width + existing.width) / 2;
          const averageHeight = (candidate.height + existing.height) / 2;
          return Math.abs(centerX - existing.left - existing.width / 2) < averageWidth * 0.72
            && Math.abs(centerY - existing.top - existing.height / 2) < averageHeight * 0.72;
        });
        if (!samePhysicalRegion) anchoredOuterCandidates.push(candidate);
      });
    const requireStrongOuterEvidence = anchoredOuterCandidates.length >= 2 && anchoredOuterCandidates.length <= 5;
    const axisDeduplicated = assignGridPositions(deduplicateRectangles(consideredCandidates, Number(options.iouThreshold || 0.45)))
      .filter(row => row.score >= (row.signals.localCardFieldSupport ? Math.max(0.58, minimumScore - 0.04)
        : requireStrongOuterEvidence ? Math.max(minimumScore, 0.80) : minimumScore)
        && (!requireStrongOuterEvidence || isAnchoredOuterCandidate(row)
          || (row.signals.outerBoundaryScore >= 0.55 && row.signals.edgeContinuity >= 0.45)))
      .slice(0, Math.max(1, Number(options.maximumDetections || 80)));
    const axisEnvelope = axisDeduplicated.length ? {
      left: Math.min(...axisDeduplicated.map(row => row.left)),
      top: Math.min(...axisDeduplicated.map(row => row.top)),
      right: Math.max(...axisDeduplicated.map(row => row.left + row.width)),
      bottom: Math.max(...axisDeduplicated.map(row => row.top + row.height))
    } : null;
    let axisOverlapPairs = 0;
    for (let left = 0; left < axisDeduplicated.length; left += 1) for (let right = left + 1; right < axisDeduplicated.length; right += 1) {
      if (rectIntersectionRatio(axisDeduplicated[left], axisDeduplicated[right]) >= 0.10) axisOverlapPairs += 1;
    }
    const binderGridEvidence = axisDeduplicated.length >= 4
      && axisDeduplicated.filter(row => row.row && row.column).length >= axisDeduplicated.length * 0.60
      && axisEnvelope && (axisEnvelope.right - axisEnvelope.left) * (axisEnvelope.bottom - axisEnvelope.top) / (sample.width * sample.height) >= 0.34
      && axisOverlapPairs <= Math.max(1, axisDeduplicated.length * 0.18)
      && orientationSignals.axialRatio >= 0.48
      && orientationSignals.diagonalRatio <= 0.29;
    const preparedOriented = suppressGroupRectangles(orientedCandidates)
      .filter(row => row.score >= Math.max(0.54, minimumScore - 0.06))
      .filter(row => localFieldCandidates.length < 4 || (row.width * row.height >= localFieldMedianArea * 0.72
        && row.width * row.height <= localFieldMedianArea * 1.80))
      .filter(oriented => !axisDeduplicated.some(axis => {
        const orientedArea = oriented.orientedRect.width * oriented.orientedRect.height;
        const axisArea = axis.width * axis.height;
        return axis.signals.outerBoundaryScore >= 0.48 && orientedArea < axisArea * 0.78
          && rectContainment(oriented, axis) >= 0.82;
      }))
      .map(row => ({ ...row, row: "", column: "", signals: { ...row.signals, relativeSizeSupport: row.signals.relativeSizeSupport ?? 1 } }));
    const axisCandidatesForLoose = localFieldCandidates.length >= 4 ? [
      ...axisDeduplicated.filter(axis => axis.width * axis.height <= localFieldMedianArea * 2.0
        && !localFieldCandidates.some(local => rectContainment(local, axis) >= 0.72
          || rectIntersectionRatio(axis, local) >= 0.40)),
      ...localFieldCandidates
    ] : axisDeduplicated;
    const localSupportedAxis = axisCandidatesForLoose.filter(row => row.signals.localCardFieldSupport);
    const looseAxisPool = axisCandidatesForLoose
      .filter(row => {
        if (localSupportedAxis.length < 4 || row.signals.localCardFieldSupport) return true;
        const rowArea = row.width * row.height;
        const containedLocalCards = localSupportedAxis.filter(local => {
          if (local.width * local.height >= rowArea * 0.82) return false;
          const centerX = local.left + local.width / 2;
          const centerY = local.top + local.height / 2;
          return centerX >= row.left && centerX <= row.left + row.width
            && centerY >= row.top && centerY <= row.top + row.height;
        }).length;
        return containedLocalCards < 2;
      })
      .filter(row => !((row.candidateSource === "outer_expansion" || row.candidateSource === "perspective_window")
        && row.signals.areaRatio > 0.15
        && (orientationSignals.axialRatio < 0.50 || orientationSignals.diagonalRatio > 0.30)))
      .filter(axis => !(axis.candidateSource === "window_scan"
      && axis.signals.edgeContinuity < 0.40
      && axis.signals.edgeBalance < 0.12
      && axis.signals.outerBoundaryScore < 0.52));
    const looseAxisCandidates = clusterLooseAxisFallbacks(preparedOriented.length ? looseAxisPool.filter(axis => !preparedOriented.some(oriented =>
      rectIntersectionRatio(axis, oriented) >= 0.08
      || (axis.left + axis.width / 2 >= oriented.left && axis.left + axis.width / 2 <= oriented.left + oriented.width
        && axis.top + axis.height / 2 >= oriented.top && axis.top + axis.height / 2 <= oriented.top + oriented.height))) : looseAxisPool);
    const deduplicated = (binderGridEvidence ? axisDeduplicated
      : deduplicateRectangles([...looseAxisCandidates, ...preparedOriented], Number(options.iouThreshold || 0.45))
        .filter(row => row.score >= (row.signals.orientedGeometry ? Math.max(0.54, minimumScore - 0.06) : minimumScore)))
      .slice(0, Math.max(1, Number(options.maximumDetections || 80)));
    const detections = deduplicated.map(row => {
      const score = Math.round(row.score * 1000) / 1000;
      const quadrilateral = candidateCorners(row).map(point => ({
        x: Math.round(clamp(point.x / sample.width, 0, 1) * 1e6) / 1e6,
        y: Math.round(clamp(point.y / sample.height, 0, 1) * 1e6) / 1e6
      }));
      return {
        boundingBox: {
          x: Math.round(row.left / sample.width * 1e6) / 1e6,
          y: Math.round(row.top / sample.height * 1e6) / 1e6,
          width: Math.round(row.width / sample.width * 1e6) / 1e6,
          height: Math.round(row.height / sample.height * 1e6) / 1e6
        },
        quadrilateral,
        detectionConfidence: score >= 0.82 && row.signals.outerBoundaryScore >= 0.62 && row.signals.relativeSizeSupport >= 0.55
          ? "high" : score >= 0.68 && row.signals.outerBoundaryScore >= 0.45 ? "medium" : "low",
        detectionScore: score,
        observationSource: "automatic",
        row: row.row,
        column: row.column,
        detectionSignals: {
          ...row.signals,
          smallCardRegion: row.signals.areaRatio < 0.018,
          strongRotation: Number(row.signals.rotationDegrees) > 12,
          possiblePerspective: row.signals.edgeBalance < 0.28,
          candidateSource: row.candidateSource,
          orientedCorners: quadrilateral.flatMap(point => [point.x, point.y])
        }
      };
    }).filter(row => normalizedBoundingBox(row.boundingBox));
    const rejectedMultiCardRegions = rejectedMultiCardCandidates.map(row => ({
      boundingBox: {
        x: Math.round(row.left / sample.width * 1e6) / 1e6,
        y: Math.round(row.top / sample.height * 1e6) / 1e6,
        width: Math.round(row.width / sample.width * 1e6) / 1e6,
        height: Math.round(row.height / sample.height * 1e6) / 1e6
      },
      detectionConfidence: "low",
      detectionScore: Math.min(0.49, Math.round(row.score * 1000) / 1000),
      multiCardBoxScore: Math.round(row.signals.multiCardBoxScore * 1000) / 1000,
      containedCardStructures: Number(row.signals.containedCardStructures || 0),
      localCardAreaRatio: Number(row.signals.localCardAreaRatio || 0)
    })).filter(region => !detections.some(detection => {
      const regionArea = region.boundingBox.width * region.boundingBox.height;
      const detectionArea = detection.boundingBox.width * detection.boundingBox.height;
      const areaRatio = regionArea / Math.max(0.000001, detectionArea);
      return areaRatio >= 0.72 && areaRatio <= 1.38 && boundingBoxIoU(region.boundingBox, detection.boundingBox) >= 0.60;
    }));
    const debugCandidates = options.debugCandidates ? calibratedCandidates
      .filter(row => row.signals.areaRatio >= 0.055)
      .sort((left, right) => right.score - left.score)
      .slice(0, 200)
      .map(row => ({
        left: row.left,
        top: row.top,
        width: row.width,
        height: row.height,
        score: row.score,
        source: row.candidateSource,
        signals: row.signals
      })) : undefined;
    const debugAxisCandidates = options.debugCandidates ? calibratedCandidates
      .filter(row => row.candidateSource !== "outer_expansion")
      .sort((left, right) => right.score - left.score)
      .slice(0, 200)
      .map(row => ({
        left: row.left,
        top: row.top,
        width: row.width,
        height: row.height,
        score: row.score,
        source: row.candidateSource,
        signals: row.signals
      })) : undefined;
    const debugOrientedCandidates = options.debugCandidates ? orientedCandidates
      .sort((left, right) => right.score - left.score)
      .slice(0, 200)
      .map(row => ({
        left: row.left,
        top: row.top,
        width: row.width,
        height: row.height,
        score: row.score,
        source: row.candidateSource,
        signals: row.signals
      })) : undefined;
    const debugFinalAxisPool = options.debugCandidates ? looseAxisPool.map(row => ({
      left: row.left,
      top: row.top,
      width: row.width,
      height: row.height,
      score: row.score,
      source: row.candidateSource,
      signals: row.signals
    })) : undefined;
    const sceneAnalysis = analyzeCollectionScene(detections, photoQuality, { orientationSignals });
    return {
      detections,
      photoQuality,
      sceneAnalysis,
      parameters: {
        iouThreshold: Number(options.iouThreshold || 0.45),
        minimumScore,
        maxDimension: options.maxDimension || 480,
        detectorMode: sceneAnalysis.sceneType === "binder_grid" ? "binder_protected" : "rotation_aware_loose_cards",
        orientationSignals,
        debugCandidates,
        debugAxisCandidates,
        debugOrientedCandidates,
        debugFinalAxisPool,
        localCardModel: dynamicGeometry.model,
        rejectedMultiCardRegions
      }
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

  function evaluateCollectionDetections(expected = [], detected = [], configuration = 0.50) {
    const options = typeof configuration === "number" ? { iouThreshold: configuration } : (configuration || {});
    const iouThreshold = clamp(Number(options.iouThreshold ?? 0.50), 0, 1);
    const minimumCoverage = clamp(Number(options.minimumCoverage ?? 0), 0, 1);
    const maximumAreaRatio = Number.isFinite(Number(options.maximumAreaRatio)) ? Math.max(1, Number(options.maximumAreaRatio)) : Infinity;
    const strictOuterBoxes = Boolean(options.strictOuterBoxes || minimumCoverage > 0);
    const expectedRows = expected.map(row => ({
      boundingBox: normalizedBoundingBox(row?.boundingBox || row) || quadrilateralBoundingBox(row?.quadrilateral),
      quadrilateral: normalizedQuadrilateral(row?.quadrilateral),
      occluded: Boolean(row?.occluded),
      visibleFraction: Number.isFinite(Number(row?.visibleFraction)) ? clamp(Number(row.visibleFraction), 0, 1) : null
    })).filter(row => row.boundingBox);
    const detectedRows = detected.map(row => ({
      boundingBox: normalizedBoundingBox(row?.boundingBox || row) || quadrilateralBoundingBox(row?.quadrilateral),
      quadrilateral: normalizedQuadrilateral(row?.quadrilateral)
    })).filter(row => row.boundingBox);
    const expectedBoxes = expectedRows.map(row => row.boundingBox);
    const detectedBoxes = detectedRows.map(row => row.boundingBox);
    const pairs = [];
    expectedBoxes.forEach((expectedBox, expectedIndex) => detectedBoxes.forEach((detectedBox, detectedIndex) => {
      const expectedPolygon = expectedRows[expectedIndex].quadrilateral;
      const detectedPolygon = detectedRows[detectedIndex].quadrilateral;
      pairs.push({ expectedIndex, detectedIndex, ...boundingBoxOverlap(expectedBox, detectedBox),
        polygonIoU: expectedPolygon && detectedPolygon ? polygonIoU(expectedPolygon, detectedPolygon) : null });
    }));
    pairs.sort((left, right) => right.iou - left.iou || right.coverage - left.coverage);
    const usedExpected = new Set();
    const usedDetected = new Set();
    const matches = [];
    for (const pair of pairs) {
      if (pair.iou < iouThreshold || (strictOuterBoxes && pair.coverage < minimumCoverage) || pair.areaRatio > maximumAreaRatio
        || usedExpected.has(pair.expectedIndex) || usedDetected.has(pair.detectedIndex)) continue;
      usedExpected.add(pair.expectedIndex);usedDetected.add(pair.detectedIndex);matches.push(pair);
    }
    const innerCropPairs = pairs.filter(pair => !usedExpected.has(pair.expectedIndex)
      && !usedDetected.has(pair.detectedIndex)
      && pair.detectedCoverage >= 0.82
      && pair.coverage < Math.max(minimumCoverage, 0.72)
      && pair.areaRatio < 0.78);
    const innerCropDetections = new Set(innerCropPairs.map(row => row.detectedIndex)).size;
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
      meanCoverage: matches.length ? matches.reduce((sum, row) => sum + row.coverage, 0) / matches.length : 0,
      meanAreaRatio: matches.length ? matches.reduce((sum, row) => sum + row.areaRatio, 0) / matches.length : 0,
      meanPolygonIoU: matches.some(row => row.polygonIoU !== null)
        ? matches.filter(row => row.polygonIoU !== null).reduce((sum, row) => sum + row.polygonIoU, 0) / matches.filter(row => row.polygonIoU !== null).length : null,
      polygonMatchCount: matches.filter(row => row.polygonIoU !== null).length,
      occludedExpectedCards: expectedRows.filter(row => row.occluded).length,
      partiallyVisibleExpectedCards: expectedRows.filter(row => row.visibleFraction !== null && row.visibleFraction < 0.999).length,
      innerCropDetections,
      innerCropPairs,
      precision,
      recall,
      f1: precision + recall ? 2 * precision * recall / (precision + recall) : 0,
      iouThreshold,
      minimumCoverage,
      maximumAreaRatio: Number.isFinite(maximumAreaRatio) ? maximumAreaRatio : null,
      strictOuterBoxes
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
      const value = channel === "red" ? red : channel === "green" ? green : channel === "blue" ? blue : Math.round(red * 0.299 + green * 0.587 + blue * 0.114);
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

  function observationCorners(observation, imageWidth, imageHeight) {
    const quadrilateral = normalizedQuadrilateral(observation?.quadrilateral);
    if (quadrilateral) return quadrilateral.map(point => ({ x: point.x * imageWidth, y: point.y * imageHeight }));
    const box = normalizedBoundingBox(observation?.boundingBox || observation);
    if (!box) return [];
    let left = box.x * imageWidth;
    let top = box.y * imageHeight;
    let width = box.width * imageWidth;
    let height = box.height * imageHeight;
    const aspect = width / Math.max(1, height);
    if (aspect > CARD_ASPECT * 1.08) {
      const expectedHeight = Math.min(imageHeight, width / CARD_ASPECT);
      if (box.y + box.height >= 0.90) top = Math.max(0, top + height - expectedHeight);
      else if (box.y <= 0.10) top = 0;
      else top = Math.max(0, top - (expectedHeight - height) / 2);
      height = Math.min(expectedHeight, imageHeight - top);
    } else if (aspect < CARD_ASPECT * 0.90) {
      const expectedWidth = Math.min(imageWidth, height * CARD_ASPECT);
      if (box.x + box.width >= 0.90) left = Math.max(0, left + width - expectedWidth);
      else if (box.x <= 0.10) left = 0;
      else left = Math.max(0, left - (expectedWidth - width) / 2);
      width = Math.min(expectedWidth, imageWidth - left);
    }
    return axisAlignedCorners({ left, top, width, height });
  }

  function orientedCardPoint(u, v, orientation) {
    if (orientation === 180) return { u: 1 - u, v: 1 - v };
    if (orientation === 90) return { u: 1 - v, v: u };
    if (orientation === 270) return { u: v, v: 1 - u };
    return { u, v };
  }

  function quadrilateralPoint(corners, u, v) {
    const [topLeft, topRight, bottomRight, bottomLeft] = corners;
    return {
      x: (1 - u) * (1 - v) * topLeft.x + u * (1 - v) * topRight.x + u * v * bottomRight.x + (1 - u) * v * bottomLeft.x,
      y: (1 - u) * (1 - v) * topLeft.y + u * (1 - v) * topRight.y + u * v * bottomRight.y + (1 - u) * v * bottomLeft.y
    };
  }

  function sampleObservationRegion(source, corners, kind, orientation = 0) {
    const layout = REGION_LAYOUTS[kind] || REGION_LAYOUTS.title;
    const distance = (left, right) => Math.hypot(right.x - left.x, right.y - left.y);
    const cardWidth = (distance(corners[0], corners[1]) + distance(corners[3], corners[2])) / 2;
    const cardHeight = (distance(corners[0], corners[3]) + distance(corners[1], corners[2])) / 2;
    const aspect = clamp(cardWidth / Math.max(1, cardHeight), 0.50, 0.88);
    const isTitleRegion = kind.startsWith("title");
    const targetHeight = Number(layout.targetHeight || (isTitleRegion ? 180 : 96));
    const targetWidth = clamp(Math.round(targetHeight * layout.width * aspect / Math.max(0.001, layout.height)), 140, isTitleRegion ? 1500 : 700);
    const values = new Uint8ClampedArray(targetWidth * targetHeight * 4);
    for (let y = 0; y < targetHeight; y += 1) {
      for (let x = 0; x < targetWidth; x += 1) {
        const baseU = layout.x + ((x + 0.5) / targetWidth) * layout.width;
        const baseV = layout.y + ((y + 0.5) / targetHeight) * layout.height;
        const oriented = orientedCardPoint(baseU, baseV, orientation);
        const point = quadrilateralPoint(corners, oriented.u, oriented.v);
        const sourceX = clamp(point.x, 0, source.width - 1);
        const sourceY = clamp(point.y, 0, source.height - 1);
        const left = Math.floor(sourceX);
        const top = Math.floor(sourceY);
        const right = Math.min(source.width - 1, left + 1);
        const bottom = Math.min(source.height - 1, top + 1);
        const mixX = sourceX - left;
        const mixY = sourceY - top;
        const offsets = [
          (top * source.width + left) * 4,
          (top * source.width + right) * 4,
          (bottom * source.width + left) * 4,
          (bottom * source.width + right) * 4
        ];
        const targetOffset = (y * targetWidth + x) * 4;
        for (let channel = 0; channel < 3; channel += 1) {
          const topValue = source.data[offsets[0] + channel] * (1 - mixX) + source.data[offsets[1] + channel] * mixX;
          const bottomValue = source.data[offsets[2] + channel] * (1 - mixX) + source.data[offsets[3] + channel] * mixX;
          values[targetOffset + channel] = Math.round(topValue * (1 - mixY) + bottomValue * mixY);
        }
        values[targetOffset + 3] = 255;
      }
    }
    return { width: targetWidth, height: targetHeight, data: values };
  }

  function regionVariantCanvas(region, channel = "luma", thresholded = false, inverted = false) {
    const canvas = document.createElement("canvas");
    canvas.width = region.width;
    canvas.height = region.height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const pixels = context.createImageData(region.width, region.height);
    const histogram = new Uint32Array(256);
    const values = new Uint8Array(region.width * region.height);
    for (let index = 0; index < values.length; index += 1) {
      const offset = index * 4;
      const red = region.data[offset];
      const green = region.data[offset + 1];
      const blue = region.data[offset + 2];
      const value = channel === "red" ? red : channel === "green" ? green : channel === "blue" ? blue : Math.round(red * 0.299 + green * 0.587 + blue * 0.114);
      values[index] = value;
      histogram[value] += 1;
    }
    const low = percentile(histogram, values.length, 0.02);
    const high = Math.max(low + 12, percentile(histogram, values.length, 0.98));
    const threshold = low + (high - low) * 0.56;
    for (let index = 0; index < values.length; index += 1) {
      let normalized = clamp(Math.round((values[index] - low) * 255 / (high - low)), 0, 255);
      if (thresholded) {
        const bright = values[index] >= threshold;
        normalized = (inverted ? !bright : bright) ? 255 : 0;
      }
      const offset = index * 4;
      pixels.data[offset] = normalized;
      pixels.data[offset + 1] = normalized;
      pixels.data[offset + 2] = normalized;
      pixels.data[offset + 3] = 255;
    }
    context.putImageData(pixels, 0, 0);
    return canvas;
  }

  function regionVariantDataUrl(region, channel = "luma", thresholded = false, inverted = false) {
    return regionVariantCanvas(region, channel, thresholded, inverted).toDataURL("image/png");
  }

  function estimateHorizontalSkew(region) {
    const width = region.width;
    const height = region.height;
    if (width < 80 || height < 40) return 0;
    const values = new Float32Array(width * height);
    for (let index = 0; index < values.length; index += 1) {
      const offset = index * 4;
      values[index] = region.data[offset] * 0.299 + region.data[offset + 1] * 0.587 + region.data[offset + 2] * 0.114;
    }
    const gradient = new Float32Array(width * height);
    for (let y = 1; y < height - 1; y += 1) for (let x = 0; x < width; x += 1) {
      gradient[y * width + x] = Math.abs(values[(y + 1) * width + x] - values[(y - 1) * width + x]);
    }
    let best = { degrees: 0, score: 0 };
    const centerX = (width - 1) / 2;
    for (let degrees = -12; degrees <= 12; degrees += 2) {
      const slope = Math.tan(degrees * Math.PI / 180);
      let strongest = 0;
      for (let baseY = Math.round(height * 0.08); baseY <= Math.round(height * 0.72); baseY += 2) {
        let total = 0;
        let count = 0;
        for (let x = 2; x < width - 2; x += 3) {
          const y = Math.round(baseY + slope * (x - centerX));
          if (y <= 1 || y >= height - 2) continue;
          total += gradient[y * width + x];
          count += 1;
        }
        if (count >= width / 9) strongest = Math.max(strongest, total / count);
      }
      if (strongest > best.score) best = { degrees, score: strongest };
    }
    return Math.abs(best.degrees) >= 2 ? best.degrees : 0;
  }

  function deskewedRegionDataUrl(region, channel = "luma") {
    const source = regionVariantCanvas(region, channel);
    const degrees = estimateHorizontalSkew(region);
    if (!degrees) return source.toDataURL("image/png");
    const radians = -degrees * Math.PI / 180;
    const cosine = Math.abs(Math.cos(radians));
    const sine = Math.abs(Math.sin(radians));
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(source.width * cosine + source.height * sine);
    canvas.height = Math.ceil(source.width * sine + source.height * cosine);
    const context = canvas.getContext("2d");
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.translate(canvas.width / 2, canvas.height / 2);
    context.rotate(radians);
    context.drawImage(source, -source.width / 2, -source.height / 2);
    return canvas.toDataURL("image/png");
  }

  function regionLocalContrastDataUrl(region, channel = "luma") {
    const width = region.width;
    const height = region.height;
    const values = new Float32Array(width * height);
    const integral = new Float64Array((width + 1) * (height + 1));
    for (let y = 0; y < height; y += 1) {
      let rowSum = 0;
      for (let x = 0; x < width; x += 1) {
        const offset = (y * width + x) * 4;
        const red = region.data[offset];
        const green = region.data[offset + 1];
        const blue = region.data[offset + 2];
        const value = channel === "red" ? red : channel === "green" ? green : channel === "blue" ? blue : red * 0.299 + green * 0.587 + blue * 0.114;
        values[y * width + x] = value;
        rowSum += value;
        integral[(y + 1) * (width + 1) + x + 1] = integral[y * (width + 1) + x + 1] + rowSum;
      }
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const pixels = context.createImageData(width, height);
    const radius = Math.max(5, Math.round(Math.min(width, height) * 0.055));
    for (let y = 0; y < height; y += 1) {
      const top = Math.max(0, y - radius);
      const bottom = Math.min(height, y + radius + 1);
      for (let x = 0; x < width; x += 1) {
        const left = Math.max(0, x - radius);
        const right = Math.min(width, x + radius + 1);
        const sum = integral[bottom * (width + 1) + right] - integral[top * (width + 1) + right]
          - integral[bottom * (width + 1) + left] + integral[top * (width + 1) + left];
        const mean = sum / Math.max(1, (right - left) * (bottom - top));
        const normalized = clamp(Math.round(128 + (values[y * width + x] - mean) * 2.4), 0, 255);
        const offset = (y * width + x) * 4;
        pixels.data[offset] = normalized;
        pixels.data[offset + 1] = normalized;
        pixels.data[offset + 2] = normalized;
        pixels.data[offset + 3] = 255;
      }
    }
    context.putImageData(pixels, 0, 0);
    return canvas.toDataURL("image/png");
  }

  function sampledLuma(region, targetWidth, targetHeight) {
    const values = [];
    for (let y = 0; y < targetHeight; y += 1) {
      for (let x = 0; x < targetWidth; x += 1) {
        const sourceX = clamp(Math.floor((x + 0.5) * region.width / targetWidth), 0, region.width - 1);
        const sourceY = clamp(Math.floor((y + 0.5) * region.height / targetHeight), 0, region.height - 1);
        const offset = (sourceY * region.width + sourceX) * 4;
        values.push(Math.round(region.data[offset] * 0.299 + region.data[offset + 1] * 0.587 + region.data[offset + 2] * 0.114));
      }
    }
    return values;
  }

  function artworkFingerprint(region, variant = "artwork") {
    const differenceGrid = sampledLuma(region, 9, 8);
    let bits = "";
    for (let y = 0; y < 8; y += 1) for (let x = 0; x < 8; x += 1) {
      bits += differenceGrid[y * 9 + x] > differenceGrid[y * 9 + x + 1] ? "1" : "0";
    }
    const histogram = new Array(64).fill(0);
    const stride = Math.max(1, Math.floor(Math.sqrt(region.width * region.height / 18000)));
    let samples = 0;
    for (let y = 0; y < region.height; y += stride) for (let x = 0; x < region.width; x += stride) {
      const offset = (y * region.width + x) * 4;
      const red = Math.min(3, Math.floor(region.data[offset] / 64));
      const green = Math.min(3, Math.floor(region.data[offset + 1] / 64));
      const blue = Math.min(3, Math.floor(region.data[offset + 2] / 64));
      histogram[red * 16 + green * 4 + blue] += 1;
      samples += 1;
    }
    const grid = sampledLuma(region, 8, 8);
    const mean = grid.reduce((sum, value) => sum + value, 0) / Math.max(1, grid.length);
    const deviation = Math.sqrt(grid.reduce((sum, value) => sum + (value - mean) ** 2, 0) / Math.max(1, grid.length)) || 1;
    return {
      version: "art-v1",
      variant,
      dHash: bits.match(/.{1,4}/g).map(group => parseInt(group, 2).toString(16)).join(""),
      histogram: histogram.map(value => Math.round(value / Math.max(1, samples) * 10000) / 10000),
      lumaGrid: grid.map(value => Math.round((value - mean) / deviation * 1000) / 1000)
    };
  }

  async function prepareCollectionObservationRecognitionPayload(imageDataUrl, observation = {}) {
    if (observation?.observationSource === "automatic"
      && (observation?.detectionSignals?.multiCardBoxLikely === true || observation?.detectionSignals?.multiCardGridLikely === true)) {
      return {
        imageDataUrl: "",
        passes: [],
        candidateLimit: 0,
        artworkFingerprints: [],
        skipRecognition: true,
        skipReason: "binder_multi_card_region",
        message: "Kartenfläche prüfen: Der erkannte Bereich umfasst wahrscheinlich mehrere Binder-Rasterzellen. Die Namens-OCR wurde nicht ausgeführt."
      };
    }
    const image = await loadImage(imageDataUrl);
    const sourceCanvas = document.createElement("canvas");
    sourceCanvas.width = image.naturalWidth;
    sourceCanvas.height = image.naturalHeight;
    const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });
    sourceContext.drawImage(image, 0, 0);
    const source = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
    const corners = observationCorners(observation, source.width, source.height);
    if (corners.length !== 4) throw new Error("Für diese Kartenbeobachtung fehlt ein gültiger Bildausschnitt.");
    const box = normalizedBoundingBox(observation?.boundingBox || observation);
    const hasPerspectiveGeometry = Boolean(normalizedQuadrilateral(observation?.quadrilateral));
    const boxAspect = box ? (box.width * source.width) / Math.max(1, box.height * source.height) : CARD_ASPECT;
    const rotation = Math.abs(Number(observation?.rotation || observation?.detectionSignals?.rotationDegrees || 0)) % 180;
    const probablySideways = !hasPerspectiveGeometry && (boxAspect > 1.05 || (rotation >= 55 && rotation <= 125));
    const orientations = probablySideways ? [90, 270] : [0, 180];
    const passes = [];
    for (const orientation of orientations) {
      const title = sampleObservationRegion(source, corners, "title", orientation);
      passes.push({ kind: "title", variant: `observation-${orientation}-luma`, segmentation: "raw-line", imageDataUrl: regionVariantDataUrl(title, "luma") });
      passes.push({ kind: "title", variant: `observation-${orientation}-sparse-luma`, segmentation: "sparse", imageDataUrl: regionVariantDataUrl(title, "luma") });
      passes.push({ kind: "title", variant: `observation-${orientation}-sparse-threshold`, segmentation: "sparse", imageDataUrl: regionVariantDataUrl(title, "luma", true) });
      const titleHigh = sampleObservationRegion(source, corners, "titleHigh", orientation);
      passes.push({ kind: "title", variant: `observation-${orientation}-high-luma`, segmentation: "sparse", imageDataUrl: regionVariantDataUrl(titleHigh, "luma") });
      const titleLower = sampleObservationRegion(source, corners, "titleLower", orientation);
      passes.push({ kind: "title", variant: `observation-${orientation}-lower-luma`, segmentation: "sparse", imageDataUrl: regionVariantDataUrl(titleLower, "luma") });
      const titleWide = sampleObservationRegion(source, corners, "titleWide", orientation);
      passes.push({ kind: "title", variant: `observation-${orientation}-wide-luma`, segmentation: "sparse", imageDataUrl: regionVariantDataUrl(titleWide, "luma") });
      passes.push({ kind: "title", variant: `observation-${orientation}-wide-threshold`, segmentation: "sparse", imageDataUrl: regionVariantDataUrl(titleWide, "luma", true) });
      passes.push({ kind: "title", variant: `observation-${orientation}-wide-deskew`, segmentation: "sparse", imageDataUrl: deskewedRegionDataUrl(titleWide, "luma") });
      const setCode = sampleObservationRegion(source, corners, "setCode", orientation);
      passes.push({ kind: "setCode", variant: `observation-${orientation}-luma`, imageDataUrl: regionVariantDataUrl(setCode, "luma", true) });
      const passcode = sampleObservationRegion(source, corners, "passcode", orientation);
      passes.push({ kind: "passcode", variant: `observation-${orientation}-local-contrast`, segmentation: "sparse", imageDataUrl: regionLocalContrastDataUrl(passcode) });
    }
    const artworkFingerprints = ["artwork", "artworkWide"].map(kind => artworkFingerprint(sampleObservationRegion(source, corners, kind, orientations[0]), kind));
    return {
      imageDataUrl: passes[0]?.imageDataUrl || imageDataUrl,
      passes: passes.slice(0, 20),
      candidateLimit: 5,
      artworkFingerprints,
      cropInfo: {
        sourceWidth: source.width,
        sourceHeight: source.height,
        perspectiveCorrected: hasPerspectiveGeometry,
        orientations
      }
    };
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
    boundingBoxOverlap,
    normalizedQuadrilateral,
    polygonIoU,
    analyzeCollectionScene,
    fallbackBounds,
    detectCardBoundsFromRgba,
    candidateBoundsFromRgba,
    detectCollectionCardsFromRgba,
    detectCollectionCardsFromDataUrl,
    evaluateCollectionDetections,
    regionRect,
    artworkFingerprint,
    prepareCollectionObservationRecognitionPayload,
    prepareRecognitionPayload
  });
});
