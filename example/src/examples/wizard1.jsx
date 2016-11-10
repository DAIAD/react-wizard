import React from 'react';
import { PlainInput, SelectColors, ConfirmColors } from '../WizardItems';

import createWizard from '../../../src/';
const Wizard = createWizard();

function Step1 (props) {
  const { title, description, value, setValue, errors, onPreviousClicked, onNextClicked, onComplete, reset } = props;
  return (
    <div>
      <h3>{title}</h3>
      <p>{description}</p>
      <PlainInput {...{value, setValue}} />
      { errors ? <div><br /><span>Validation fail: {errors}</span></div> : <div /> }
      <button onClick={onNextClicked} style={{float: 'right'}}>Next</button>
    </div>
  );
}

function Step2 (props) {
  const { title, description, value, setValue, errors, onPreviousClicked, onNextClicked, onComplete, reset } = props;
  return (
    <div>
      <h3>{title}</h3>
      <p>{description}</p>
      <SelectColors {...{value, setValue}} />
      { errors ? <div><span>Validation fail: {errors}</span></div> : <div /> }
      <button onClick={onPreviousClicked} style={{float: 'left'}}>Previous</button>
      <button onClick={onNextClicked} style={{float: 'right'}}>Next</button>
    </div>
  );
}

function Step3 (props) {
  const { title, description, value, values, setValue, errors, onPreviousClicked, onNextClicked, onComplete, reset, completed } = props;
  return (
    <div>
      <h3>{title}</h3>
      <p>{description}</p>
      <ConfirmColors {...{value, setValue, values}} />
      <br />
      { errors ? <div><span>Validation fail: {errors}</span></div> : <div /> }
      <button onClick={onPreviousClicked} style={{float: 'left'}}>Previous</button>
      { completed ? 
        <button onClick={reset} style={{ float: 'right' }}>Start over?</button>
        :
          <button onClick={onComplete} style={{float: 'right'}}>Send</button>
       }
    </div>
  );
}

export function WizardExample1 (props) {
  return (
    <Wizard
      onComplete={values => { alert(`Wizard complete: \n ${JSON.stringify(values)}`); }}
      >
        <Step1
          id='name'
          title='Hello'
          description='Just write your name'
          initialValue=''
          validate={value => { if (!value) { throw 'No noname'; } }}
        />
        <Step2
          id='colors'
          title='Colors'
          initialValue={[]}
          description='Select your favorite colors'
          validate={values => { if (!values.length > 0) { throw 'Select at least one'; }}}
        />
        <Step3
          id='confirm'
          title='Confirmation'
          description='Please confirm'
          initialValue=''
        />

      </Wizard>
  );
}
