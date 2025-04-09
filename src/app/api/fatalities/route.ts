import { NextResponse } from "next/server";
import csvParser from "csv-parser";
import fs from "fs";
import path from "path";
import { Fatality } from "@/app/types/types";

interface FatalityRow {
  lat: string;
  long: string;
}

export async function GET(): Promise<Response> {
  const filePath = path.join(process.cwd(), "public", "data", "fatalities.csv");
  const fatalities: Fatality[] = [];

  return new Promise<Response>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row: FatalityRow) => {
        if (row.lat && row.long) {
          fatalities.push({
            latitude: parseFloat(row.lat),
            longitude: parseFloat(row.long),
          });
        }
      })
      .on("end", () => {
        resolve(NextResponse.json(fatalities));
      })
      .on("error", () => {
        reject(
          NextResponse.json({ error: "Error parsing CSV" }, { status: 500 })
        );
      });
  });
}
