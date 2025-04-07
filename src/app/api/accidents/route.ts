import { NextResponse } from 'next/server';
import csvParser from 'csv-parser';
import fs from 'fs';
import path from 'path';

interface Accident {
  latitude: number;
  longitude: number;
}

export async function GET() {
  const filePath = path.join(process.cwd(), 'public', 'data', 'bike_accidents.csv');
  const accidents: Accident[] = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row: any) => {
        if (row.lat && row.long) {
          accidents.push({
            latitude: parseFloat(row.lat),
            longitude: parseFloat(row.long),
          });
        }
      })
      .on('end', () => {
        resolve(NextResponse.json(accidents));
      })
      .on('error', (error) => {
        reject(NextResponse.json({ error: 'Error parsing CSV' }, { status: 500 }));
      });
  });
} 