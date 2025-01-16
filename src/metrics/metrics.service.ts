import {
  Injectable,
  OnModuleDestroy,
  UnauthorizedException,
} from "@nestjs/common";
import * as http from "http";
import * as httpProxy from "http-proxy";
import * as url from "url";

import { isEmpty } from "class-validator";
import { JsonService } from "src/utils/services/json.service";
import { Metric } from "./dto/metric.dto";

@Injectable()
export class MetricsService implements OnModuleDestroy {
  constructor(private readonly jsonService: JsonService) {}
  private proxy = httpProxy.createProxyServer({});
  private bandwidthUsage = 0;
  private siteVisits: Record<string, number> = {};

  getMetrics(): Metric {
    return {
      bandwidth_usage: `${(this.bandwidthUsage / (1024 * 1024)).toFixed(2)}MB`,
      top_sites: Object.entries(this.siteVisits)
        .sort(([, a], [, b]) => b - a)
        .map(([url, visits]) => ({ url, visits }))
        .slice(0, 10),
    };
  }

  handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    const proxyAuthHeader = req.headers["proxy-authorization"];
    if (!proxyAuthHeader) {
      throw new UnauthorizedException("Proxy-Authorization header is missing");
    }

    if (!proxyAuthHeader.startsWith("Basic ")) {
      throw new UnauthorizedException(
        "Proxy-Authorization must use Basic authentication"
      );
    }

    // Decode Base64 credentials
    const base64Credentials = proxyAuthHeader.slice(6).trim();
    const decodedCredentials = Buffer.from(
      base64Credentials,
      "base64"
    ).toString("utf-8");

    // Extract username and password
    const [username, password] = decodedCredentials.split(":");
    if (isEmpty(username) || isEmpty(password)) {
      throw new UnauthorizedException("username or password required");
    }

    const targetUrl = req.url ? url.parse(req.url).href : "";
    const hostname = targetUrl ? url.parse(targetUrl).hostname : "";

    this.proxy.web(req, res, { target: targetUrl }, (err) => {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Something went wrong.");
    });

    req.on("data", (chunk) => {
      this.bandwidthUsage += chunk.length;
    });

    req.on("end", () => {
      if (hostname) {
        this.siteVisits[hostname] = (this.siteVisits[hostname] || 0) + 1;
      }
    });
  }

  onModuleDestroy() {
    console.log("Server shutting down...");
    try {
      const filePath = "./proxy-metrics.json";
      let oldMetrics = this.jsonService.readJsonFile(filePath);

      if (!oldMetrics) {
        oldMetrics = [];
      }
      const newMetrics = this.getMetrics();
      oldMetrics.push({ ...oldMetrics, time: new Date() });

      this.jsonService.writeJsonFile(filePath, oldMetrics);
    } catch (error) {
      console.log(`Failed to store metrics into json`);
    }
  }
}
