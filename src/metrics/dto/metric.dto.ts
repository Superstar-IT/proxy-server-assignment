import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUrl,
  Min,
} from "class-validator";

export class SiteDetails {
  @ApiProperty({ type: String, required: true, example: "google.com" })
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ type: Number, required: true, example: "10" })
  @IsInt()
  @IsNotEmpty()
  @Min(0)
  visits: number;
}

export class Metric {
  @ApiProperty({ type: String, required: true, example: "125MB" })
  @IsString()
  @IsNotEmpty()
  bandwidth_usage: string;

  @ApiProperty({ type: SiteDetails, isArray: true })
  @IsArray()
  @IsNotEmpty()
  top_sites: SiteDetails[];
}
