/*
 * @Description: asd
 * @Author: MADAO
 * @Date: 2021-03-02 16:12:35
 * @LastEditors: MADAO
 * @LastEditTime: 2021-04-08 22:14:51
 */
module.exports = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'admin',
  password: 'DeepInAbyss',
  database: 'development',
  synchronize: false,
  logging: false,
  entities: [
    `${__dirname}dist/entity/**/*.js`, // wtf https://stackoverflow.com/questions/56693067/entity-metadata-for-roleusers-was-not-found
  ],
  migrations: [
    'dist/migration/**/*.js',
  ],
  subscribers: [
    'dist/subscriber/**/*.js',
  ],
  cli: {
    entitiesDir: 'dist/entity',
    migrationsDir: 'dist/migration',
    subscribersDir: 'dist/subscriber',
  },
};
