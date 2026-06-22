import { NextResponse } from 'next/server';
import { existsSync } from 'fs';
import path from 'path';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors });
}

export async function GET() {
  const root = process.cwd();
  // Check if a pre-built APK was placed in public/
  const apkPath = path.join(root, 'public', 'luna-dashboard.apk');
  const apkExists = existsSync(apkPath);

  return NextResponse.json({
    success: true,
    apk: {
      available: apkExists,
      downloadUrl: apkExists ? '/luna-dashboard.apk' : null,
      buildMethod: 'GitHub Actions — push to main triggers APK build automatically',
      githubRepo: 'https://github.com/mechristjesus-code/luna-dashboard',
      actionsUrl: 'https://github.com/mechristjesus-code/luna-dashboard/actions',
      buildWorkflow: '.github/workflows/build-apk.yml',
      instructions: [
        '1. Push code to GitHub (already done)',
        '2. GitHub Actions builds APK automatically via Capacitor',
        '3. Download APK from Actions → Artifacts section',
        '4. Or: clone repo, run pnpm build:apk, find APK in android/app/build/outputs/apk/release/',
      ],
      localBuildCommands: [
        'git clone https://github.com/mechristjesus-code/luna-dashboard.git',
        'cd luna-dashboard && pnpm install',
        'pnpm build && npx cap sync android',
        'cd android && ./gradlew assembleRelease',
        '# APK: android/app/build/outputs/apk/release/app-release.apk',
      ],
    },
  }, { headers: cors });
}
