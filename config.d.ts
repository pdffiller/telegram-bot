declare class MySQLConfig {
  host: string;
  dialect: string;
  username: string;
  password: string;
  database: string;
}

declare class Config {
  mysql: MySQLConfig;

  botId: string;
}

declare module 'config' {
  const config: Config;

  export default config;
}