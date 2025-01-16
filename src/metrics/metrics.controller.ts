import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse } from "@nestjs/swagger";
import { Metric } from "./dto/metric.dto";
import { MetricsService } from "./metrics.service";

@Controller("metrics")
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @ApiOkResponse({ type: Metric })
  getMetrics(): Metric {
    return this.metricsService.getMetrics();
  }
}
