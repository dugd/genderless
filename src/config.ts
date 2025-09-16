import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

export const FILE_PATH: string = process.env.FILE_PATH ?? './assets/tree.json';
