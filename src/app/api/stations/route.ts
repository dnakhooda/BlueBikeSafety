import { NextResponse } from "next/server";
import csvParser from "csv-parser";
import fs from "fs";
import path from "path";
import { BlueBikeStation } from "@/app/types/types";

interface BikeStationRow {
  Lat: string;
  Long: string;
  NAME: string;
}

export async function GET(): Promise<Response> {
  const filePath = path.join(
    process.cwd(),
    "public",
    "data",
    "uncleanData.csv"
  );
  const stations: BlueBikeStation[] = [];

  return new Promise<Response>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row: BikeStationRow) => {
        if (row.NAME && row.Lat && row.Long) {
          stations.push({
            name: row.NAME,
            latitude: parseFloat(row.Lat),
            longitude: parseFloat(row.Long),
          });
        }
      })
      .on("end", () => {
        resolve(NextResponse.json(stations));
      })
      .on("error", () => {
        reject(
          NextResponse.json({ error: "Error parsing CSV" }, { status: 500 })
        );
      });
  });
}
