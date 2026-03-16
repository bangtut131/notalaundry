import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const dataFile = path.join(process.cwd(), 'data', 'settings.json');

const defaultSettings = {
  storeName: 'Nota Laundry PRO',
  storeAddress: 'Jl. Sudirman No 42, Kota Pusat',
  enableWaha: true
};

function readSettings() {
  try {
    if (fs.existsSync(dataFile)) {
      const content = fs.readFileSync(dataFile, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Error reading settings', error);
  }
  return defaultSettings;
}

function writeSettings(newSettings: any) {
  try {
    if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
      fs.mkdirSync(path.join(process.cwd(), 'data'));
    }
    fs.writeFileSync(dataFile, JSON.stringify(newSettings, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing settings', error);
    return false;
  }
}

export async function GET() {
  const currentSettings = readSettings();
  return NextResponse.json(currentSettings);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const currentSettings = readSettings();
    const updatedSettings = { ...currentSettings, ...body };
    
    const success = writeSettings(updatedSettings);
    if (success) {
      return NextResponse.json(updatedSettings);
    } else {
      return NextResponse.json({ error: 'Failed to write settings' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
