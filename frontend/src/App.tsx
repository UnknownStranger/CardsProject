import * as React from 'react';
import './App.css';
import * as d3 from 'd3';
import _ from 'lodash';
import { Button } from '@material-ui/core';

function App() {
  interface Log {
    timestamp: number;
    ability: string;
    target: string;
  }

  const [logsData] = React.useState(parseLogs());
  //organizing the data better for iteration and changing ID values to strings for target and ability
  async function parseLogs() {
    const parsedLogs: Log[] = [];
    //either /db/getall for every report
    //or /db/id/*log code*
    const data: any = await d3.json('/db/getall');

    const cards = [
      { id: 1001882, name: 'Balance' },
      { id: 1001883, name: 'Bole' },
      { id: 1001884, name: 'Arrow' },
      { id: 1001885, name: 'Spear' },
      { id: 1001886, name: 'Ewer' },
      { id: 1001887, name: 'Spire' },
    ];

    data.forEach((log: { actors: any[]; events: any[] }) => {
      const actors = log.actors;

      log.events.forEach((event) => {
        const temp = { timestamp: 0, ability: '', target: '' };

        cards.forEach((card) => {
          if (card.id === event.abilityGameID) {
            temp.timestamp = event.timestamp;
            temp.ability = card.name;
          }
        });

        actors.forEach((actor) => {
          actor.IDs.forEach((id: number) => {
            if (id === event.targetID) {
              temp.target = actor.name;
            }
          });
        });

        parsedLogs.push(temp);
      });
    });
    parsedLogs.sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1));
    return parsedLogs;
  }

  async function drawChart() {
    const data = await logsData;
    const raidMembersOverTime: typeof raidMembers[] = [];
    console.log(data.length);
    const cardsPerStep = 25;
    const raidMembers = [
      {
        name: 'Unknown Stranger',
        color: 'rgb(193, 140, 0)',
        cardCount: 0,
        nick: 'Unkle',
        events: [] as Log[],
      },
      {
        name: 'Spooky Smile',
        color: 'rgb(132, 169, 87)',
        cardCount: 0,
        nick: 'Spooks',
        events: [] as Log[],
      },
      {
        name: "Mikan A'malus",
        color: 'rgb(157, 22, 90)',
        cardCount: 0,
        nick: 'Mikan',
        events: [] as Log[],
      },
      {
        name: 'Akuma Rayne',
        color: 'rgb(211, 113, 113)',
        cardCount: 0,
        nick: 'Rayne',
        events: [] as Log[],
      },
      {
        name: "Pyne A'malus",
        color: 'rgb(109, 98, 43)',
        cardCount: 0,
        nick: 'Pyne',
        events: [] as Log[],
      },
      {
        name: "Syn Wy'verian",
        color: 'rgb(231, 218, 200)',
        cardCount: 0,
        nick: 'Syn',
        events: [] as Log[],
      },
      {
        name: 'Izaya Yukimura',
        color: 'rgb(188, 34, 184)',
        cardCount: 0,
        nick: 'Izzy',
        events: [] as Log[],
      },
      {
        name: "Carter Wy'verian",
        color: 'rgb(231, 210, 69)',
        cardCount: 0,
        nick: 'Carter',
        events: [] as Log[],
      },
    ];

    for (let i = 0; i < Math.ceil(data.length / cardsPerStep); i++) {
      let stepCount = 0;

      data.forEach((event) => {
        raidMembers.forEach((m) => {
          if (m.name === event.target) {
            m.events.push(event);
            m.cardCount++;
          }
        });
      });
      if (stepCount % cardsPerStep === 0 || stepCount === data.length) {
        raidMembers.sort((a, b) => (a.cardCount > b.cardCount ? -1 : 1));
        const temp = _.cloneDeep(raidMembers);
        raidMembersOverTime.push(temp);
      }
      stepCount++;
    }

    const width = 800 < window.innerWidth ? 800 : window.innerWidth;
    //start chart setup
    const dimensions = {
      width: width,
      height: width * 0.6,
      margin: {
        top: 30,
        right: 10,
        bottom: 50,
        left: 100,
      },
      boundedWidth: 0,
      boundedHeight: 0,
    };

    dimensions.boundedWidth =
      dimensions.width - dimensions.margin.left - dimensions.margin.right;
    dimensions.boundedHeight =
      dimensions.height - dimensions.margin.top - dimensions.margin.bottom;
    d3.select('#wrapper').selectChildren('svg').remove();
    const wrapper = d3
      .select('#wrapper')
      .append('svg')
      .attr('width', dimensions.width)
      .attr('height', dimensions.height);
    //end chart setup

    const max =
      raidMembersOverTime[raidMembersOverTime.length - 1][0].cardCount;
    const ratio = dimensions.boundedWidth / max;
    const timer = (waitTime: number) =>
      new Promise((res) => setTimeout(res, waitTime));

    raidMembers.forEach(m => {
      m.cardCount = 0;
    });

    for(let i = 0; i < data.length - 1; i++){
      const event = data[i];
      raidMembers.forEach((m) => {
        if (m.name === event.target) {
          m.cardCount++;
        }
      });

      //start axis logic
      const y = d3
        .scaleBand()
        .domain(raidMembers.map((v) => v.nick))
        .rangeRound([0, dimensions.height]);

      const names = d3.axisLeft(y);

      wrapper
        .append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(${dimensions.margin.left}, 0)`)
        .transition()
        .duration(50)
        .call(names)
        .call((g) => g.select('.domain').remove());
      //end axis logic

      //start bar drawing logic
      wrapper
        .selectAll('bar')
        .data(raidMembers)
        .join('rect')
        .style('fill', (v) => v.color)
        .attr('class', 'bar')
        .attr('x', dimensions.width / 2)
        .attr('y', dimensions.height)
        .transition()
        .duration(150)
        .delay(function (d, i) {
          return i * 50;
        })
        .attr('x', dimensions.margin.left)
        .attr('width', (v) => v.cardCount * ratio)
        .attr('y', (v, i) => y.bandwidth() * i)
        .attr('height', y.bandwidth() * 0.9);
      //end bar drawing logic
      //timeout for loop to animate
      await timer(16);
    };

    // for(let i = 0; i < raidMembersOverTime.length; i++){
    //   let log = raidMembersOverTime[i];
    //   //start axis logic
    //   const y = d3
    //     .scaleBand()
    //     .domain(log.map((v) => v.nick))
    //     .rangeRound([0, dimensions.height]);

    //   const names = d3.axisLeft(y);

    //   wrapper
    //     .append('g')
    //     .attr('class', 'axis')
    //     .attr('transform', `translate(${dimensions.margin.left}, 0)`)
    //     .transition()
    //     .duration(50)
    //     .call(names)
    //     .call((g) => g.select('.domain').remove());
    //   //end axis logic

    //   //start bar drawing logic
    //   wrapper
    //     .selectAll('bar')
    //     .data(log)
    //     .join('rect')
    //     .style('fill', (v) => v.color)
    //     .attr('class', 'bar')
    //     .attr('x', dimensions.width/2)
    //     .attr('y', dimensions.height)
    //     .transition()
    //     .duration(150)
    //     .delay(function (d, i) {
    //       return i * 50;
    //     })
    //     .attr('x', dimensions.margin.left)
    //     .attr('width', (v) => v.cardCount * ratio)
    //     .attr('y', (v, i) => y.bandwidth() * i)
    //     .attr('height', y.bandwidth() * 0.9);
    //   //end bar drawing logic
    //   //timeout for loop to animate
    //   await timer(50);
    // };

    let d = d3.rollup(
      data,
      ([d]) => d.ability,
      (d) => d.timestamp,
      (d) => d.target
    );
    console.log(d);
  }

  React.useEffect(() => {
    drawChart();
  });

  return (
    <div className="App">
      <header className="App-header">
        <div className="left">
          <div id="wrapper"></div>
          <h1> Cards go brrrrrrr.</h1>
          <Button variant="contained" color="primary" onClick={drawChart}>
            Redraw Graph
          </Button>
        </div>
      </header>
    </div>
  );
}

export default App;
