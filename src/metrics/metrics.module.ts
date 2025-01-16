import { Module } from "@nestjs/common";
import { MetricsService } from "./metrics.service";
import { MetricsController } from "./metrics.controller";
import { JsonService } from "src/utils/services/json.service";

@Module({
  controllers: [MetricsController],
  providers: [MetricsService, JsonService],
})
export class MetricsModule {}
