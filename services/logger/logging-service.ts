import winston from "winston";

// Loggin Levels
export enum severityList {
  emerg = "emerg",
  alert = "alert",
  crit = "crit",
  error = "error",
  warning = "warning",
  notice = "notice",
  info = "info",
  debug = "debug",
}

export class LogginService {
  private papertrail: winston.transports.HttpTransportInstance;
  private logger: winston.Logger;

  constructor() {
    const papertrail = new winston.transports.Http({
      host: "logs.collector.solarwinds.com",
      path: "/v1/log",
      auth: {
        username: " ",
        password:
          process.env.PAPER_TRAIL_TOKEN ?? "ZxIOYxe2Es1XO4oY1iemxeB8TmW8",
      },
      ssl: true,
    });
    const logger = winston.createLogger({
      transports: [papertrail],
    });
    this.papertrail = papertrail;
    this.logger = logger;
  }

  public sendMessage(message: Object | string, severity: severityList) {
    this.logger.log({ level: severity, message: JSON.stringify(message) });
  }
}
