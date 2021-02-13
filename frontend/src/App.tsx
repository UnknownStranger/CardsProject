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

  const raidMembers = [
    {
      name: 'Unknown Stranger',
      color: 'rgb(193, 140, 0)',
      cardCount: 0,
      nick: 'Unkle',
    },
    {
      name: 'Spooky Smile',
      color: 'rgb(132, 169, 87)',
      cardCount: 0,
      nick: 'Spooks',
    },
    {
      name: "Mikan A'malus",
      color: 'rgb(157, 22, 90)',
      cardCount: 0,
      nick: 'Mikan',
    },
    {
      name: 'Akuma Rayne',
      color: 'rgb(211, 113, 113)',
      cardCount: 0,
      nick: 'Rayne',
    },
    {
      name: "Pyne A'malus",
      color: 'rgb(109, 98, 43)',
      cardCount: 0,
      nick: 'Pyne',
    },
    {
      name: "Syn Wy'verian",
      color: 'rgb(231, 218, 200)',
      cardCount: 0,
      nick: 'Syn',
    },
    {
      name: 'Izaya Yukimura',
      color: 'rgb(188, 34, 184)',
      cardCount: 0,
      nick: 'Izzy',
    },
    {
      name: "Carter Wy'verian",
      color: 'rgb(231, 210, 69)',
      cardCount: 0,
      nick: 'Carter',
    },
  ];
  const raidMembersOverTime: typeof raidMembers[] = [];

  async function firstPass() {
    const data = await logsData;
    const cardsPerStep = 10;

    for (let i = 0; i < Math.ceil(data.length / cardsPerStep); i++) {
      let stepCount = i * cardsPerStep;

      for (; stepCount < i * cardsPerStep + cardsPerStep; stepCount++) {
        const event = data[stepCount];
        if (event) {
          raidMembers.forEach((m) => {
            if (m.name === event.target) {
              m.cardCount++;
            }
          });
        }
      }

      if (stepCount % cardsPerStep === 0 || stepCount === data.length) {
        raidMembers.sort((a, b) => (a.cardCount > b.cardCount ? -1 : 1));
        const temp = _.cloneDeep(raidMembers);
        raidMembersOverTime.push(temp);
      }
    }

    drawChart();
  }

  async function drawChart() {
    const timing = 500;
    //start chart setup
    const width = 800 < window.innerWidth ? 800 : window.innerWidth;
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

    for (let i = 0; i < raidMembersOverTime.length; i++) {
      let log = raidMembersOverTime[i];
      console.log(log);
      //start axis logic
      const y = d3
        .scaleBand()
        .domain(log.map((v) => v.nick))
        .rangeRound([0, dimensions.height]);

      const names = d3.axisLeft(y);

      wrapper.selectAll('g').remove();

      wrapper
        .append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(${dimensions.margin.left}, 0)`)
        .call(names)
        .transition()
        .duration(timing)
        .call((g) => g.select('.domain').remove());
      //end axis logic

      //start bar drawing logic
      wrapper.selectAll('rect').remove();
      const cardHeight = y.bandwidth() * 0.8;
      const cardWidth = cardHeight * 0.65;

      wrapper
        .selectAll('card')
        .data(log)
        .join('rect')
        .style('fill', (v) => v.color)
        .attr('class', 'card')
        .attr('class', (v) => v.name)
        .attr('x', dimensions.width / 2 - cardWidth / 2)
        .attr('y', dimensions.height + cardHeight / 2)
        .attr('width', cardWidth)
        .attr('height', cardHeight)
        .transition()
        .duration(100)
        .delay(function (d, i) {
          return i * 50;
        })
        .attr('x', (v) => v.cardCount * ratio + dimensions.margin.left)
        .attr('y', (v, i) => y.bandwidth() * i)
        .remove();

      wrapper
        .selectAll('bar')
        .data(log)
        .join('rect')
        .style('fill', (v) => v.color)
        .attr('class', 'bar')
        .attr('x', dimensions.margin.left)
        .attr('y', (v, i) => y.bandwidth() * i)
        .attr('width', (v) => v.cardCount * ratio)
        .attr('height', y.bandwidth() * 0.9);
      //end bar drawing logic
      //timeout for loop to animate
      await timer(timing);
    }
  }

  React.useEffect(() => {
    firstPass();
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
