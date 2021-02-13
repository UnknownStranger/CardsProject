import { Injectable } from '@nestjs/common';
import { Log } from './log.class';
import { DatabaseService } from '../../database/database.service';
import {
  ApolloClient,
  InMemoryCache,
  gql,
  HttpLink,
  NormalizedCacheObject,
} from '@apollo/client';
import fetch from 'cross-fetch';

@Injectable()
export class AuthService {
  constructor(private readonly databaseService: DatabaseService) {}

  token: string;
  userID = 200950;
  date: Date;
  logID: string;
  reports = [];
  events = [];

  actors = [
    { name: "Carter Wy'verian", IDs: [0] },
    { name: "Syn Wy'verian", IDs: [0] },
    { name: 'Izaya Yukimura', IDs: [0] },
    { name: "Pyne A'malus", IDs: [0] },
    { name: "Mikan A'malus", IDs: [0] },
    { name: 'Akuma Rayne', IDs: [0] },
    { name: 'Spooky Smile', IDs: [0] },
    { name: 'Unknown Stranger', IDs: [0] },
  ];

  actorIDs = [];

  abilities = [1001882, 1001884, 1001883, 1001885, 1001886, 1001887];
  currentStatic = true;

  createClient = (authToken: string) => {
    return new ApolloClient({
      link: new HttpLink({
        uri: 'https://www.fflogs.com/api/v2/user',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        fetch,
      }),
      cache: new InMemoryCache(),
    });
  };

  client: ApolloClient<NormalizedCacheObject>;

  async generateLog() {
    this.client = this.createClient(this.token);
    this.fetchFights();
    return {
      message: "Populating Database, please wait. Or don't I'm not your mom.",
    };
  }

  async fetchFights() {
    const x = await this.client.query({
      query: gql`
         query {
          reportData {
            reports(userID: ${this.userID}) {
              data {
                startTime
                code
                zone {
                  name
                  id
                }
              }
            }
          }
        }
      `,
    });

    x.data.reportData.reports.data.forEach((report) => {
      this.reports.push(report);
    });

    for (let i = 0; i < this.reports.length - 1; i++) {
      console.log(`Checking log: ${this.reports[i].code}`);
      console.log(`${i + 1}/ ${this.reports.length} complete`)
      if(!(await this.databaseService.checkID(this.reports[i].code))){
        this.date = new Date(this.reports[i].startTime);
        await this.fetchActors(this.reports[i].code);
      }
    }
    console.log('finished populating database');
  }

  async fetchActors(code: string) {
    const x = await this.client.query({
      query: gql`
        query {
          reportData{
            report(code: "${code}") {
              fights{
                startTime,
                endTime,
              }
              masterData {
                actors {
                  name
                  id
                }
              }
            }
          }
        }
      `,
    });

    this.currentStatic = true;
    this.logID = code;

    //temp stop for empty reports
    if(x.data.reportData.report.fights.length < 1)return;
    const startTime = x.data.reportData.report.fights[0].startTime;
    const endTime =
      x.data.reportData.report.fights[
        x.data.reportData.report.fights.length - 1
      ].endTime;
    
    //reseccting actor IDS as they change each fight
    this.actors.forEach((a) => {
      a.IDs = [];
    });

    x.data.reportData.report.masterData.actors.forEach(
      (actor: { name: string; id: number }) => {
        this.actors.forEach((a) => {
          if (actor.name === a.name) {
            a.IDs.push(actor.id);
          }
        });
      }
    );

    this.actors.forEach((a) => {
      if (a.IDs.length === 0) {
        this.currentStatic = false;
      }
    });

    if (this.currentStatic) {
      await this.fetchEvents(code, startTime, endTime);
    }
  }

  async fetchEvents(code: string, startTime: number, endTime: number) {
    this.events = [];
    for (const sourceID of this.actors[0].IDs) {
      for (const abilityID of this.abilities) {
        const x = await this.client.query({
          query: gql`
          query{
            reportData {
              report(code: "${code}") {
                events(startTime: ${startTime}, endTime: ${endTime}, targetID: ${sourceID}, abilityID: ${abilityID}, dataType: Buffs) {
                  data
                }
              }
            }
          }`,
        });
        this.events.push(x.data.reportData.report.events.data);
      }
    }
    await this.filterEvents();
  }

  async filterEvents() {
    this.actorIDs = [];
    this.actors.forEach((actor) => {
      actor.IDs.forEach((ID) => {
        this.actorIDs.push(ID);
      });
    });
    const tempArray = [];
    for (const eventArr of this.events) {
      for (const event of eventArr) {
        if (
          event.type == 'applybuff' &&
          this.actorIDs.includes(event.targetID)
        ) {
          tempArray.push(event);
        }
      }
    }
    this.events = tempArray;
    await this.finalize();
  }

  async finalize() {
    console.log(this.date);
    const l = new Log(this.userID, this.date, this.logID, this.actors, this.events);
    await this.databaseService.create(l);
  }
}
