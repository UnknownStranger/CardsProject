export class Log {
  user: number;
  logID: string;
  actors: {name: string, IDs: number[]}[];
  events: unknown[];

  constructor(
    user: number,
    logID: string,
    actors: {name: string, IDs: number[]}[],
    events: unknown[],
  ) {
    this.user = user;
    this.logID = logID;
    this.actors = actors;
    this.events = events;
  }
}
