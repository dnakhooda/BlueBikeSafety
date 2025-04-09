import { NextResponse } from "next/server";
import csvParser from "csv-parser";
import fs from "fs";
import path from "path";
import { Accident } from "@/app/types/types";

interface AccidentRow {
  lat: string;
  long: string;
  dispatch_ts: string;
}

export async function GET(): Promise<Response> {
  const filePath = path.join(
    process.cwd(),
    "public",
    "data",
    "bike_accidents.csv"
  );
  const accidents: Accident[] = [];

  return new Promise<Response>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row: AccidentRow) => {
        if (row.lat && row.long) {
          accidents.push({
            latitude: parseFloat(row.lat),
            longitude: parseFloat(row.long),
            time: row.dispatch_ts,
          });
        }
      })
      .on("end", () => {
        resolve(NextResponse.json(accidents));
      })
      .on("error", () => {
        reject(
          NextResponse.json({ error: "Error parsing CSV" }, { status: 500 })
        );
      });
  });
}
