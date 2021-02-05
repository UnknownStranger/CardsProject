import * as React from 'react';
import './App.css';
import * as d3 from 'd3';

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

    data.forEach((event) => {
      raidMembers.forEach((m) => {
        if (m.name === event.target) {
          m.events.push(event);
          m.cardCount++;
        }
      });
    });

    raidMembers.sort((a, b) => (a.cardCount > b.cardCount ? -1 : 1));
    const max = raidMembers[0].cardCount;
    const width = 800 < window.innerWidth ? 800 : window.innerWidth;
    const ratio = width / max;

    const dimensions = {
      width: width,
      height: width * 0.6,
      margin: {
        top: 30,
        right: 10,
        bottom: 50,
        left: 50,
      },
      boundedWidth: 0,
      boundedHeight: 0,
    };

    dimensions.boundedWidth =
      dimensions.width - dimensions.margin.left - dimensions.margin.right;
    dimensions.boundedHeight =
      dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

    const wrapper = d3
      .select('#wrapper')
      .append('svg')
      .attr('width', dimensions.width)
      .attr('height', dimensions.height);

    const y = d3
      .scaleBand()
      .domain(raidMembers.map((v, i) => v.nick))
      .rangeRound([dimensions.margin.top, dimensions.height])
      .padding(0.1);

    wrapper
      .selectAll('bar')
      .data(raidMembers)
      .join('rect')
      .style('fill', (v) => v.color)
      .attr('class', 'bar')
      .attr('width', (v) => v.cardCount * ratio)
      .attr('y', (v,i) => y.bandwidth() * i)
      .attr('height', y.bandwidth() * 0.9);

    console.log(raidMembers);
    console.log(d3.rollup(data, ([d]) => d.ability, d => d.timestamp, d => d.target));
    
  }

  React.useEffect(() => {
    drawChart();
  });

  return (
    <div className="App">
      <header className="App-header">
        <div id="wrapper"> </div>
        <h1> Cards go brrrrrrr.</ h1>
      </header>
    </div>
  );
}

export default App;
