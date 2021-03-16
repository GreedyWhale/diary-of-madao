import 'reflect-metadata';
import { ConnectionManager } from 'typeorm';
import ormConfig from '~/ormconfig.json';
import { User } from '~/model/entity/User';
import { Blog } from '~/model/entity/Blog';
import { Comment } from '~/model/entity/Comment';

const getConnection = async () => {
  const connectionManager = new ConnectionManager();
  const currentConnection = connectionManager.has('default') && connectionManager.get('default');
  if (currentConnection && currentConnection.isConnected) {
    return currentConnection;
  }
  // @ts-ignore
  const connection = connectionManager.create({
    ...ormConfig,
    // https://github.com/typeorm/typeorm/issues/1327#issuecomment-455791578
    entities: [User, Blog, Comment],
  });
  await connection.connect();
  return connection;
};

export default getConnection;
