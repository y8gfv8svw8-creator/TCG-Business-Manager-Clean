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
        const overlap = rectIntersectionRatio(candidate, existing);
        if (overlap >= iouThreshold) { rejected = true;break; }
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

  function boostRegularTwoByTwoGrid(candidates, enabled = true) {
    if (!enabled) return candidates;
    const preliminary = candidates.filter(row => row.score >= 0.42
      && row.signals.areaRatio >= 0.085
      && row.signals.areaRatio <= 0.25
      && row.signals.aspectScore >= 0.52
      && row.signals.outerBoundaryScore >= 0.40)
      .sort((left, right) => right.score - left.score);
    const pool = [];
    preliminary.forEach(candidate => {
      if (pool.length >= 120 || pool.some(existing => rectIntersectionRatio(candidate, existing) >= 0.72)) return;
      pool.push(candidate);
    });
    if (pool.length < 4) return candidates;
    const center = row => ({ x: row.left + row.width / 2, y: row.top + row.height / 2 });
    const horizontalPairs = [];
    for (let leftIndex = 0; leftIndex < pool.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < pool.length; rightIndex += 1) {
        let left = pool[leftIndex];let right = pool[rightIndex];
        if (center(left).x > center(right).x) [left, right] = [right, left];
        const averageWidth = (left.width + right.width) / 2;
        const averageHeight = (left.height + right.height) / 2;
        const widthRatio = left.width / Math.max(1, right.width);
        const heightRatio = left.height / Math.max(1, right.height);
        const deltaX = (center(right).x - center(left).x) / Math.max(1, averageWidth);
        const deltaY = Math.abs(center(right).y - center(left).y) / Math.max(1, averageHeight);
        if (widthRatio < 0.70 || widthRatio > 1.43 || heightRatio < 0.70 || heightRatio > 1.43
          || deltaX < 0.90 || deltaX > 1.70 || deltaY > 0.30 || rectIntersectionRatio(left, right) > 0.12) continue;
        horizontalPairs.push({ left, right, centerY: (center(left).y + center(right).y) / 2, averageWidth, averageHeight,
          score: left.score + right.score - deltaY * 0.55 - Math.abs(deltaX - 1.12) * 0.26
            - Math.abs(Math.log(widthRatio)) * 0.12 - Math.abs(Math.log(heightRatio)) * 0.12 });
      }
    }
    const rows = horizontalPairs.sort((left, right) => right.score - left.score).slice(0, 100);
    let best = null;
    for (let topIndex = 0; topIndex < rows.length; topIndex += 1) {
      for (let bottomIndex = topIndex + 1; bottomIndex < rows.length; bottomIndex += 1) {
        let top = rows[topIndex];let bottom = rows[bottomIndex];
        if (top.centerY > bottom.centerY) [top, bottom] = [bottom, top];
        const members = [top.left, top.right, bottom.left, bottom.right];
        if (new Set(members).size < 4) continue;
        const averageHeight = members.reduce((sum, row) => sum + row.height, 0) / 4;
        const averageWidth = members.reduce((sum, row) => sum + row.width, 0) / 4;
        const verticalDistance = (bottom.centerY - top.centerY) / Math.max(1, averageHeight);
        const leftAlignment = Math.abs(center(top.left).x - center(bottom.left).x) / Math.max(1, averageWidth);
        const rightAlignment = Math.abs(center(top.right).x - center(bottom.right).x) / Math.max(1, averageWidth);
        if (verticalDistance < 0.90 || verticalDistance > 1.70 || leftAlignment > 0.34 || rightAlignment > 0.34) continue;
        const areaLogs = members.map(row => Math.log(Math.max(1, row.width * row.height)));
        const areaVariation = Math.max(...areaLogs) - Math.min(...areaLogs);
        if (areaVariation > 0.72) continue;
        const layoutMinLeft = Math.min(...members.map(row => row.left));
        const layoutMinTop = Math.min(...members.map(row => row.top));
        const layoutMaxRight = Math.max(...members.map(row => row.left + row.width));
        const layoutMaxBottom = Math.max(...members.map(row => row.top + row.height));
        const layoutImageArea = members.reduce((sum, row) => sum + (row.width * row.height) / Math.max(0.0001, row.signals.areaRatio), 0) / 4;
        const layoutEnvelopeRatio = (layoutMaxRight - layoutMinLeft) * (layoutMaxBottom - layoutMinTop) / Math.max(1, layoutImageArea);
        const averageAreaRatio = members.reduce((sum, row) => sum + row.signals.areaRatio, 0) / 4;
        const layoutScore = top.score + bottom.score - leftAlignment * 0.30 - rightAlignment * 0.30
          - Math.abs(verticalDistance - 1.12) * 0.10 - areaVariation * 0.12
          + clamp(layoutEnvelopeRatio, 0, 0.90) * 0.90 + clamp(averageAreaRatio, 0, 0.24) * 0.45;
        if (!best || layoutScore > best.score) best = { members, score: layoutScore };
      }
    }
    if (!best) return candidates;
    const minLeft = Math.min(...best.members.map(row => row.left));
    const minTop = Math.min(...best.members.map(row => row.top));
    const maxRight = Math.max(...best.members.map(row => row.left + row.width));
    const maxBottom = Math.max(...best.members.map(row => row.top + row.height));
    const estimatedImageArea = best.members.reduce((sum, row) => sum + (row.width * row.height) / Math.max(0.0001, row.signals.areaRatio), 0) / 4;
    const envelopeRatio = (maxRight - minLeft) * (maxBottom - minTop) / Math.max(1, estimatedImageArea);
    if (envelopeRatio < 0.38) return candidates;
    const anchoredRegions = [];
    candidates.filter(isAnchoredOuterCandidate).forEach(candidate => {
      const centerX = candidate.left + candidate.width / 2;
      const centerY = candidate.top + candidate.height / 2;
      const duplicateRegion = anchoredRegions.some(existing => {
        const averageWidth = (candidate.width + existing.width) / 2;
        const averageHeight = (candidate.height + existing.height) / 2;
        return Math.abs(centerX - existing.left - existing.width / 2) < averageWidth * 0.72
          && Math.abs(centerY - existing.top - existing.height / 2) < averageHeight * 0.72;
      });
      if (!duplicateRegion) anchoredRegions.push(candidate);
    });
    if (anchoredRegions.length >= 7) return candidates;
    const selected = new Set(best.members);
    return candidates.map(candidate => selected.has(candidate) ? {
      ...candidate,
      score: clamp(candidate.score + 0.28, 0, 1),
      signals: { ...candidate.signals, regularGridSupport: true }
    } : candidate);
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

  function detectCollectionCardsFromRgba(data, width, height, options = {}) {
    if (!data || width < 40 || height < 40) return { detections: [], photoQuality: { warnings: ["image_too_small"] }, parameters: { iouThreshold: 0.45 } };
    const sample = downsampleRgba(data, width, height, options.maxDimension || 480);
    const gradients = gradientAnalysis(sample.gray, sample.width, sample.height, sample);
    const photoQuality = imageQualityFromAnalysis(sample, gradients);
    if (photoQuality.warnings.includes("low_contrast") && gradients.mean < 4) return { detections: [], photoQuality, parameters: { iouThreshold: 0.45, minimumScore: 0.60 } };
    const integralX = integralImage(gradients.gradientX, sample.width, sample.height);
    const integralY = integralImage(gradients.gradientY, sample.width, sample.height);
    const integralGray = integralImage(sample.gray, sample.width, sample.height);
    const integralRed = integralImage(sample.red, sample.width, sample.height);
    const integralGreen = integralImage(sample.green, sample.width, sample.height);
    const integralBlue = integralImage(sample.blue, sample.width, sample.height);
    const context = { width: sample.width, height: sample.height, gradients, integralX, integralY, integralGray, integralRed, integralGreen, integralBlue, sampleContrast: sample.contrast };
    const candidates = [];
    for (const component of foregroundComponents(sample)) {
      const scored = scoreCardRectangle(component, context, clamp(component.fillRatio * 1.8, 0, 1), component.rotation);
      if (scored && scored.score >= 0.44) { scored.candidateSource = "contrast_component";candidates.push(scored); }
    }
    for (const component of binaryEdgeComponents(gradients, sample.width, sample.height)) {
      const perimeter = Math.max(1, 2 * (component.width + component.height));
      const strength = clamp(component.edgePixels / perimeter, 0, 1);
      const scored = scoreCardRectangle(component, context, strength, component.rotation);
      if (scored && scored.score >= 0.42) candidates.push(scored);
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
    const calibratedCandidates = boostRegularTwoByTwoGrid(
      recalibrateCandidateScales(boostOuterContainment(candidates)),
      sample.height / Math.max(1, sample.width) >= 1.12
    );
    const regularGridCandidates = calibratedCandidates.filter(row => row.signals.regularGridSupport);
    const consideredCandidates = regularGridCandidates.length === 4 ? regularGridCandidates : calibratedCandidates;
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
    const deduplicated = assignGridPositions(deduplicateRectangles(consideredCandidates, Number(options.iouThreshold || 0.45)))
      .filter(row => row.score >= (requireStrongOuterEvidence ? Math.max(minimumScore, 0.80) : minimumScore)
        && (!requireStrongOuterEvidence || isAnchoredOuterCandidate(row)
          || (row.signals.outerBoundaryScore >= 0.55 && row.signals.edgeContinuity >= 0.45)))
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
          candidateSource: row.candidateSource
        }
      };
    }).filter(row => normalizedBoundingBox(row.boundingBox));
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
    return {
      detections,
      photoQuality,
      parameters: { iouThreshold: Number(options.iouThreshold || 0.45), minimumScore, maxDimension: options.maxDimension || 480, debugCandidates }
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
    const strictOuterBoxes = Boolean(options.strictOuterBoxes || minimumCoverage > 0);
    const expectedBoxes = expected.map(row => normalizedBoundingBox(row?.boundingBox || row)).filter(Boolean);
    const detectedBoxes = detected.map(row => normalizedBoundingBox(row?.boundingBox || row)).filter(Boolean);
    const pairs = [];
    expectedBoxes.forEach((expectedBox, expectedIndex) => detectedBoxes.forEach((detectedBox, detectedIndex) => {
      pairs.push({ expectedIndex, detectedIndex, ...boundingBoxOverlap(expectedBox, detectedBox) });
    }));
    pairs.sort((left, right) => right.iou - left.iou || right.coverage - left.coverage);
    const usedExpected = new Set();
    const usedDetected = new Set();
    const matches = [];
    for (const pair of pairs) {
      if (pair.iou < iouThreshold || (strictOuterBoxes && pair.coverage < minimumCoverage)
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
      innerCropDetections,
      innerCropPairs,
      precision,
      recall,
      f1: precision + recall ? 2 * precision * recall / (precision + recall) : 0,
      iouThreshold,
      minimumCoverage,
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
    boundingBoxOverlap,
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
