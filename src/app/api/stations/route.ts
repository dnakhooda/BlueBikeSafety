import { NextResponse } from 'next/server';
import csvParser from 'csv-parser';
import fs from 'fs';
import path from 'path';

interface BlueBikeStation {
  name: string;
  latitude: number;
  longitude: number;
}

export async function GET() {
  const filePath = path.join(process.cwd(), 'src', 'uncleanData.csv');
  const stations: BlueBikeStation[] = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row: any) => {
        if (row.NAME && row.Lat && row.Long) {
          stations.push({
            name: row.NAME,
            latitude: parseFloat(row.Lat),
            longitude: parseFloat(row.Long),
          });
        }
      })
      .on('end', () => {
        resolve(NextResponse.json(stations));
      })
      .on('error', (error) => {
        reject(NextResponse.json({ error: 'Error parsing CSV' }, { status: 500 }));
      });
  });
} 