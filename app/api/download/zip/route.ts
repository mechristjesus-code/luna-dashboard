import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import { existsSync, readFileSync, mkdirSync } from 'fs';
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
  try {
    const root = process.cwd();
    const outDir = path.join(root, '.next', 'cache');
    const zipPath = path.join(outDir, 'luna-dashboard.zip');

    // Ensure cache dir exists
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

    // Build zip (exclude heavy dirs)
    execSync(
      `cd "${root}" && zip -r "${zipPath}" . \
        -x "node_modules/*" \
        -x ".next/*" \
        -x ".git/*" \
        -x ".env" \
        -x ".env.local" \
        -x "*.log" \
        -x ".local/*"`,
      { stdio: 'pipe', timeout: 60000 }
    );

    const buffer = readFileSync(zipPath);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        ...cors,
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="luna-dashboard.zip"',
        'Content-Length': String(buffer.length),
      },
    });
  } catch (err) {
    console.error('ZIP error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to create ZIP', details: String(err) },
      { status: 500, headers: cors }
    );
  }
}
