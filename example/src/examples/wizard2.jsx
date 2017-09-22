import React from 'react';
import { PlainInput, SelectColors, ConfirmColors } from '../WizardItems';

import createWizard from '../../../src/';
const Wizard = createWizard(WizardItemRender);

function WizardItemRender(props) {
  const { id, title, description, children, hasPrevious, hasNext, isLast, onNextClicked, onPreviousClicked, reset, errors, completed, step, steps, onComplete, onGoToId } = props;
  
  return (
    <div>
      <h3>{title}</h3>
      { 
        steps.map(step => (
          <span key={step.id}>
            { 
              (step.cleared || step.active) ? 
                <a href="#" style={{ marginRight: 10 }} onClick={() => onGoToId(step.id)}><span>&#10004;{`Step ${step.index+1}: ${step.title}`}</span></a>
                  : 
                  <span style={{ marginRight: 10 }}>{`Step ${step.index+1}: ${step.title}`}</span>
            }
          </span>
        ))
      }
      <h4>{description}</h4>
      { children }
      <br />
      { errors ? <div><br /><span>Validation fail: {errors}</span><br /></div> : <div /> }
      <br />
      <div>
        { 
          hasPrevious ? 
            <button className="prev" onClick={onPreviousClicked} style={{float: 'left'}}>Previous</button>
            :
              <div />
         }
         {
           completed ?
             <button onClick={reset} style={{ float: 'right' }}>Start over?</button>
             :
               (
               hasNext ?
                <button className="next" onClick={onNextClicked} style={{float: 'right'}}>Next</button>
                :
                  <button className="complete" onClick={onComplete} style={{float: 'right'}}>Send</button>
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
      {...props}
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
