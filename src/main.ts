import { ClassSerializerInterceptor, VersioningType } from "@nestjs/common";
import { NestFactory, Reflector } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { useContainer } from "class-validator";
import * as http from "http";

import { AppModule } from "./app.module";
import { MetricsModule } from "./metrics/metrics.module";
import { MetricsService } from "./metrics/metrics.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const proxyService = app.get(MetricsService);
  const proxyServer = http.createServer((req, res) => {
    proxyService.handleRequest(req, res);
  });

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.enableCors({ origin: "*" });
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.setGlobalPrefix("api/v1");
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const swaggerDocConfig = new DocumentBuilder()
    .setTitle("API Documentation")
    .setDescription("This is API documentation.")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const apiDoc = SwaggerModule.createDocument(app, swaggerDocConfig, {
    include: [AppModule, MetricsModule],
  });

  SwaggerModule.setup("api/v1/document", app, apiDoc);

  proxyServer.listen(3001, () => {
    console.log("Proxy server listening on port 3001");
  });

  process.on("SIGINT", async () => {
    proxyServer.close();
    await app.close();
    process.exit(0);
  });

  await app.listen(5000);
}
bootstrap();
