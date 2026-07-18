import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '../..');
const downloads = '/home/matteo/Downloads';
const productAssets = resolve(projectRoot, 'public/assets/products');

mkdirSync(resolve(productAssets, 'moletom'), { recursive: true });
mkdirSync(resolve(productAssets, 'kit'), { recursive: true });

function ffmpeg(args) {
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
}

for (const color of ['branco', 'preto', 'creme']) {
  ffmpeg([
    '-i',
    resolve(downloads, `moletom${color}.png`),
    '-vf',
    'scale=1000:1000:force_original_aspect_ratio=decrease,pad=1000:1250:(ow-iw)/2:(oh-ih)/2:color=black@0,format=yuva420p',
    '-frames:v',
    '1',
    '-c:v',
    'libwebp',
    '-lossless',
    '0',
    '-q:v',
    '90',
    resolve(productAssets, `moletom/${color}.webp`),
  ]);
}

ffmpeg([
  '-i',
  resolve(productAssets, 'cutouts/hybrid-logo-lateral-preto.png'),
  '-i',
  resolve(productAssets, 'cutouts/hybrid-logo-central-marrom.png'),
  '-i',
  resolve(productAssets, 'cutouts/hybrid-assinatura-preto.png'),
  '-filter_complex',
  'color=c=black@0.0:s=1000x1250:d=1[base];[0:v]scale=620:620:force_original_aspect_ratio=decrease[a];[1:v]scale=620:620:force_original_aspect_ratio=decrease[b];[2:v]scale=620:620:force_original_aspect_ratio=decrease[c];[base][a]overlay=42:290[layer1];[layer1][b]overlay=205:205[layer2];[layer2][c]overlay=370:290,format=yuva420p',
  '-frames:v',
  '1',
  '-c:v',
  'libwebp',
  '-lossless',
  '0',
  '-q:v',
  '90',
  resolve(productAssets, 'kit/selecao-3-camisetas.webp'),
]);
