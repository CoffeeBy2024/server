import { DataSource } from 'typeorm';
import config from './config';

const inputType = process.argv.find((arg) =>
  ['mongodb', 'postgres'].includes(arg)
) as 'mongodb' | 'postgres';

const dbtype = inputType || 'postgres';

export default new DataSource({
  ...config()[dbtype],
});
