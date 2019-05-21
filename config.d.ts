declare class MySQLConfig {
  host: string;
  dialect: string;
  username: string;
  password: string;
  database: string;
}

declare class SpreadSheetsConfig {
  credentialsPath: string;
  tokenPath: string;
}

declare class Config {
  mysql: MySQLConfig;
  spreadSheets: SpreadSheetsConfig;
  botId: string;
}

declare module 'config' {
  const config: Config;

  export default config;
}