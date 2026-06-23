#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { chromium } from 'playwright';

const root = resolve(import.meta.dirname, '../..');
const outputDirectory = resolve(root, 'public/assets/products/cutouts');
const targetWidth = 2048;

const sources = [
  'hybrid-logo-lateral/preto.png',
  'hybrid-logo-lateral/marrom.png',
  'hybrid-logo-central/preto.png',
  'hybrid-logo-central/marrom.png',
  'hybrid-assinatura/preto.png',
  'hybrid-assinatura/marrom.png',
  'solid-assinatura/preto.png',
  'solid-assinatura/marrom.png',
  'solid-lisa/preto.png',
  'solid-lisa/marrom.png',
];

const needsReview = [
  'hybrid-logo-lateral/branco.png',
  'hybrid-logo-central/branco.png',
  'hybrid-assinatura/branco.png',
  'solid-assinatura/branco.png',
  'solid-lisa/branco.png',
  'camiseta-branca-costas.jpg',
  'hybrid-art-branca.jpg',
  'hybrid-central-branca.jpg',
  'solid-assinatura-feminina-branca.jpg',
];

function outputName(source) {
  return source.replace(/[\\/]/g, '-').replace(/\.(png|jpg)$/i, '.png');
}

async function createCutout(page, source) {
  return page.evaluate(
    async ({ source, targetWidth }) => {
      const response = await fetch(`/assets/products/${source}`);
      if (!response.ok) throw new Error(`Não foi possível carregar ${source}.`);

      const bitmap = await createImageBitmap(await response.blob());
      const width = Math.min(targetWidth, bitmap.width);
      const height = Math.round((bitmap.height / bitmap.width) * width);
      const canvas = new OffscreenCanvas(width, height);
      const context = canvas.getContext('2d', { willReadFrequently: true });

      context.drawImage(bitmap, 0, 0, width, height);
      const sourcePixels = context.getImageData(0, 0, width, height);
      const { data } = sourcePixels;
      const length = width * height;
      const backgroundCandidate = new Uint8Array(length);
      const visited = new Uint8Array(length);

      // The source mockups share a neutral studio background. For each line, take the median
      // of the outer edges, then flood-fill only pixels that still match that local background.
      for (let y = 0; y < height; y += 1) {
        const samples = [];
        const sampleWidth = Math.max(8, Math.round(width * 0.018));

        for (let x = 0; x < sampleWidth; x += 2) {
          const left = (y * width + x) * 4;
          const right = (y * width + width - 1 - x) * 4;
          samples.push([data[left], data[left + 1], data[left + 2]]);
          samples.push([data[right], data[right + 1], data[right + 2]]);
        }

        const channelMedian = (channel) => {
          const values = samples.map((sample) => sample[channel]).sort((a, b) => a - b);
          return values[Math.floor(values.length / 2)];
        };
        const background = [channelMedian(0), channelMedian(1), channelMedian(2)];

        for (let x = 0; x < width; x += 1) {
          const pixelIndex = y * width + x;
          const offset = pixelIndex * 4;
          const distance = Math.hypot(
            data[offset] - background[0],
            data[offset + 1] - background[1],
            data[offset + 2] - background[2],
          );

          // White garments have much less separation from the studio background.
          // A tighter background threshold prevents the flood fill from eating fabric detail.
          const tolerance = source.includes('branco') ? 6 : 15;
          backgroundCandidate[pixelIndex] = distance < tolerance ? 1 : 0;
        }
      }

      const queue = new Int32Array(length);
      let queueStart = 0;
      let queueEnd = 0;
      const enqueue = (index) => {
        if (!visited[index] && backgroundCandidate[index]) {
          visited[index] = 1;
          queue[queueEnd] = index;
          queueEnd += 1;
        }
      };

      for (let x = 0; x < width; x += 1) {
        enqueue(x);
        enqueue((height - 1) * width + x);
      }
      for (let y = 1; y < height - 1; y += 1) {
        enqueue(y * width);
        enqueue(y * width + width - 1);
      }

      while (queueStart < queueEnd) {
        const index = queue[queueStart];
        queueStart += 1;
        const x = index % width;
        const y = Math.floor(index / width);

        if (x > 0) enqueue(index - 1);
        if (x < width - 1) enqueue(index + 1);
        if (y > 0) enqueue(index - width);
        if (y < height - 1) enqueue(index + width);
      }

      const component = new Int32Array(length);
      let componentId = 0;
      let mainComponent = 0;
      let mainSize = 0;
      let fallbackComponent = 0;
      let fallbackSize = 0;
      const componentQueue = new Int32Array(length);

      for (let index = 0; index < length; index += 1) {
        if (visited[index] || component[index]) continue;

        componentId += 1;
        let size = 0;
        let start = 0;
        let end = 0;
        let touchesBorder = false;
        component[index] = componentId;
        componentQueue[end] = index;
        end += 1;

        while (start < end) {
          const current = componentQueue[start];
          start += 1;
          size += 1;
          const x = current % width;
          const y = Math.floor(current / width);
          touchesBorder ||= x === 0 || x === width - 1 || y === 0 || y === height - 1;
          const neighbours = [
            x > 0 ? current - 1 : -1,
            x < width - 1 ? current + 1 : -1,
            y > 0 ? current - width : -1,
            y < height - 1 ? current + width : -1,
          ];

          for (const neighbour of neighbours) {
            if (neighbour >= 0 && !visited[neighbour] && !component[neighbour]) {
              component[neighbour] = componentId;
              componentQueue[end] = neighbour;
              end += 1;
            }
          }
        }

        if (size > fallbackSize) {
          fallbackComponent = componentId;
          fallbackSize = size;
        }

        if (!touchesBorder && size > mainSize) {
          mainComponent = componentId;
          mainSize = size;
        }
      }

      if (!mainComponent) mainComponent = fallbackComponent;

      for (let index = 0; index < length; index += 1) {
        data[index * 4 + 3] = component[index] === mainComponent ? 255 : 0;
      }

      context.putImageData(sourcePixels, 0, 0);
      const blob = await canvas.convertToBlob({ type: 'image/png' });
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let binary = '';
      const chunkSize = 0x8000;

      for (let start = 0; start < bytes.length; start += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(start, start + chunkSize));
      }

      return {
        data: btoa(binary),
        width,
        height,
        sourceWidth: bitmap.width,
        sourceHeight: bitmap.height,
      };
    },
    { source, targetWidth },
  );
}

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });

  for (const source of sources) {
    const cutout = await createCutout(page, source);
    const output = resolve(outputDirectory, outputName(source));

    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, Buffer.from(cutout.data, 'base64'));
    console.log(`${source} -> ${outputName(source)} (${cutout.width}x${cutout.height})`);
  }

  for (const source of needsReview) {
    console.log(
      `${source} -> needs-review (fundo e peça clara não podem ser separados com qualidade automática)`,
    );
  }
} finally {
  await browser.close();
}
