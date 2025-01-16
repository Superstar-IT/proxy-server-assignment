import { Injectable } from "@nestjs/common";
import * as fs from "fs";

@Injectable()
export class JsonService {
  readJsonFile(filePath: string): any {
    try {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      // Handle errors appropriately (e.g., logging, throwing a custom exception)
      console.error("Error reading JSON file:", error);
      throw error;
    }
  }

  writeJsonFile(filePath: string, data: any): void {
    try {
      const jsonData = JSON.stringify(data, null, 2); // 2 spaces for pretty formatting
      fs.writeFileSync(filePath, jsonData);
    } catch (error) {
      // Handle errors appropriately
      console.error("Error writing JSON file:", error);
      throw error;
    }
  }
}
