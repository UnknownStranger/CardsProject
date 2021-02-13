export class CreateLogsDTO{
  readonly user: number;
  readonly date: Date;
  readonly logID: string;
  readonly actors: unknown;
  readonly events: unknown[]; 
      
}