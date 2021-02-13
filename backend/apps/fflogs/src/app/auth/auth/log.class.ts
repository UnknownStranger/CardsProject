export class Log {
  user: number;
  date: Date;
  logID: string;
  actors: {name: string, IDs: number[]}[];
  events: unknown[];

  constructor(
    user: number,
    date: Date,
    logID: string,
    actors: {name: string, IDs: number[]}[],
    events: unknown[],
  ) {
    this.user = user;
    this.date = date;
    this.logID = logID;
    this.actors = actors;
    this.events = events;
  }
}
