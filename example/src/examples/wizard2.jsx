import React from 'react';
import { PlainInput, SelectColors, ConfirmColors } from '../WizardItems';

import createWizard from '../../../src/';
const Wizard = createWizard(WizardItemRender);

function WizardItemRender(props) {
  const { id, title, description, children, hasPrevious, hasNext, isLast, onNextClicked, onPreviousClicked, reset, errors, completed, step, onComplete } = props;
  
  return (
    <div>
      <h3>{title}</h3>
      <h4>Step {step}.</h4>
      <h4>{description}</h4>
      { children }
      <br />
      { errors ? <div><br /><span>Validation fail: {errors}</span><br /></div> : <div /> }
      <br />
      <div>
        { 
          hasPrevious ? 
            <button onClick={onPreviousClicked} style={{float: 'left'}}>Previous</button>
            :
              <div />
         }
         {
           completed ?
             <button onClick={reset} style={{ float: 'right' }}>Start over?</button>
             :
               (
               hasNext ?
                <button onClick={onNextClicked} style={{float: 'right'}}>Next</button>
                :
                  <button onClick={onComplete} style={{float: 'right'}}>Send</button>
               )
         }
      </div>
    </div>
  );
}

export function WizardExample2 (props) {
  return (
    <Wizard
      onComplete={values => { alert(`Wizard complete: \n ${JSON.stringify(values)}`); }}
      >
        <PlainInput
          id='name'
          title='Hello'
          description='Just write your name'
          initialValue=''
          validate={value => { if (!value) { throw 'No noname'; } }}
        />
        <SelectColors
          id='colors'
          title='Colors'
          initialValue={[]}
          description='Select your favorite colors'
          validate={values => { if (!values.length > 0) { throw 'Select at least one'; }}}
        />
        <ConfirmColors
          id='confirm'
          title='Confirmation'
          description='Please confirm'
          initialValue=''
        />
      </Wizard>
  );
}
