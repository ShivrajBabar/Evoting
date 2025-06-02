
declare module 'sqlite' {
  import { Database as SQLite3Database } from 'sqlite3';
  
  export interface Database {
    exec(sql: string): Promise<void>;
    get<T = any>(sql: string, params?: any[]): Promise<T>;
    all<T = any>(sql: string, params?: any[]): Promise<T[]>;
    run(sql: string, params?: any[]): Promise<{ lastID: number; changes: number }>;
    close(): Promise<void>;
  }
  
  export interface Options {
    filename: string;
    driver: any;
  }
  
  export function open(options: Options): Promise<Database>;
}
