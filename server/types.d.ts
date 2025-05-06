declare module 'better-sqlite3' {
  interface Database {
    prepare(sql: string): Statement;
    exec(sql: string): void;
    pragma(pragma: string, simplify?: boolean): any;
    transaction<T extends Function>(fn: T): T;
    close(): void;
  }

  interface Statement {
    run(...params: any[]): { lastInsertRowid: number; changes: number };
    get(...params: any[]): any;
    all(...params: any[]): any[];
    iterate(...params: any[]): Iterable<any>;
  }

  function Database(filename: string, options?: any): Database;
  export = Database;
}
