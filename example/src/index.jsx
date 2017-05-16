import React from 'react';
import { Switch, Route, Link } from 'react-router-dom';

import { WizardExample1, WizardExample2, WizardExample3, WizardExample4 } from './examples';

const examples = [
  {
    path: '/example-1',
    title: 'Example 1', 
    description: 'A simple example with 2 steps and confirmation', 
    component: WizardExample1, 
    url: 'https://github.com/DAIAD/react-wizard/tree/master/example/src/examples/wizard1.jsx' 
  },
  {
    path: '/example-2',
    title: 'Example 2', 
    description: 'The same example with the use of a wrapper component', 
    component: WizardExample2, 
    url: 'https://github.com/DAIAD/react-wizard/tree/master/example/src/examples/wizard2.jsx' 
  },
  {
    path: '/example-3',
    title: 'Example 3', 
    description: 'An example that demonstrates the ability to create non-linear wizard flows.', 
    component: WizardExample3, 
    url: 'https://github.com/DAIAD/react-wizard/tree/master/example/src/examples/wizard3.jsx' 
  },
  {
    path: '/example-4',
    title: 'Example 4', 
    description: 'An example that shows the flexibility of using the provided next onClick handler returned Promise. The wizard completes if the wizard item validates successfully in a single step with no further user interaction.', 
    component: WizardExample4, 
    url: 'https://github.com/DAIAD/react-wizard/tree/master/example/src/examples/wizard4.jsx' 
  }
];

function ExampleSelector ({ items, select, selected }) {
  return (
    <ul style={{listStyleType: 'none', padding: 0, margin: 0}}>
      {
        items.map((item, idx) => (
          <li key={idx} style={{display: 'inline', marginLeft: 10}}>
            <Link to={item.path}><b>{item.title}</b></Link>
          </li>
          ))
      }
      </ul>
  );
}

export default class Examples extends React.Component {

  constructor (props) {
    super(props);
  }

  render() {

    const selected = examples.find(ex => ex.path === `/${window.location.pathname.split('/').slice(-1)[0]}`) || examples[0];
    return (
      <div>
        <h1>Wizard examples</h1>
        <ExampleSelector items={examples} />
        <hr />
        <div style={{ width: '30%', float: 'left', height: '80vh', padding: 10, borderRight: '1px #000 solid' }}>
          <h2>{selected.title}</h2>
          <p>{selected.description}</p>
          <p><b>Code:</b> <a href={selected.url}>{selected.url}</a></p>
        </div>
        <div style={{ width: '50%', float: 'left', height: '80vh', padding: '10px 30px' }}> 
          <Switch>
            <Route exact path="/" component={WizardExample1} />
            {
              examples.map(ex => (
                <Route 
                  key={ex.path} 
                  path={ex.path} 
                  component={ex.component} 
                />
                ))
            }
          </Switch> 
        </div>

      </div>
    );
  }
}
