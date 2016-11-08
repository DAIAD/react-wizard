import React from 'react';
import createWizard from '../../src/';

const Wizard = createWizard(WizardItemRender);

//generic wizard item render
function WizardItemRender(props) {
  const { id, title, description, children, hasPrevious, hasNext, isLast, onNextClicked, onPreviousClicked, reset, errors, completed, step, onComplete } = props;
  
  return (
    <div>
      <h2>{title}</h2>
      <hr />
      <h3>Step {step}.</h3>
      <h4>{description}</h4>
      { children }
      <br />
      { errors ? <div><br /><span>Validation fail: {errors}</span><br /></div> : <div /> }
      <br />
      <button onClick={reset}>Reset</button>
      <br />
      <div style={{width: '30%'}}>
        { 
          hasPrevious ? 
            <button onClick={onPreviousClicked} style={{float: 'left'}}>Previous</button>
            :
              <div />
         }
         {
           hasNext ?
            <button onClick={onNextClicked} style={{float: 'right'}}>Next</button>
            :
              <button onClick={onComplete} style={{float: 'right'}}>Send</button>
        }
      </div>
    </div>
  );
}


//wizard items components
function SayYourName (props) {
  const { setValue, value } = props;
  return (
    <input onChange={e => setValue(e.target.value, e.target.value)} placeholder="Input" value={value} />
  );
}

function Fork (props) {
  const { setValue, value } = props;
  const options = ['colors', 'finish'];
  return (
    <ul>
      {
        options.map(option =>
          <li key={option}>
            <label>
              <input 
                type='radio'
                id={option}
                value={option}
                checked={value === option}
                onChange={e =>
                  setValue(e.target.value)
                }
             />
             {option}
           </label>
         </li>
         )
      }
    </ul>
  );
}

function SelectColor (props) {
  const { setValue, value } = props;
  const COLORS = ['blue', 'red', 'purple', 'orange', 'green'];
  return (
    <ul>
      {
        COLORS.map(color => 
           <li key={color}>
             <label>
               <input 
                 type="checkbox" 
                 id={color} 
                 value={color} 
                 checked={value.find(v => v === color) || false} 
                 onChange={e => 
                   e.target.checked ? 
                     setValue([...value, e.target.value]) 
                       : 
                         setValue([...value.filter(v => v != e.target.value)])
                 } 
               />
               {color}
             </label>
           </li>
        )
      }
    </ul>
  );
}

function Goodbye (props) {
  const { setValue, value, values } = props;
  const name = values.name ? values.name.values : '';
  const colors = values.colors ? values.colors.values : null;
  return (
    <div>
      {
        colors == null ? 
          <span>You were too bored to pick your favorite colors</span>
          :
          <span>Your favorite colors are: <b>{colors.join(', ')}</b></span>
       }
      <h5>Goodbye {name}!</h5>
  </div>
  );
}


function TestWizard (props) {
  return (
    <Wizard
      onComplete={values => { alert(`Wizard complete: ${JSON.stringify(values)}`); }}
      >
        <SayYourName
          id='name'
          title='Hello'
          description='Just write your name'
          initialValue=''
          validate={value => { if (!value) { throw 'Just write your name'; } }}
        />
        <Fork
          id='fork'
          title='Choose a path'
          description='Select colors or skip to finish?'
          validate={value => { 
            if (!value) 
              throw 'You must select one'; 
          }}
          initialValue='colors'
          next={value => value === 'finish' ? 'goodbye' : 'colors'}
        />
        <SelectColor
          id='colors'
          title='Colors'
          initialValue={[]}
          description='Select your favorite colors'
        />
        <Goodbye
          id='goodbye'
          title='Goodbye'
          description='Confirm'
          initialValue=''
        />
      </Wizard>
  );
}

module.exports = TestWizard;
