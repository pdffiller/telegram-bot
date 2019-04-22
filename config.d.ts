declare class MySQLConfig {
  host: string;
  dialect: string;
  username: string;
  password: string;
  database: string;
}

declare class Config {
  mysql: MySQLConfig;
}

declare module 'config' {
  const config: Config;

  export default config;
}