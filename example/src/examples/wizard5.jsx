import React from 'react';
import { PlainInput } from '../WizardItems';
import createWizard from '../../../src/';

const Wizard = createWizard(WizardItemRender);

//generic wizard item render
function WizardItemRender(props) {
  const { id, title, description, children, hasPrevious, hasNext, isLast, onNextClicked, onPreviousClicked, reset, errors, completed, step, onComplete } = props;

  return (
    <div>
      <h3>{title}</h3>
      
      <h4>Step {step.index + 1}&nbsp;{ step.cleared ? <span>&#10004;</span> : <span /> }</h4>
      <h4>{description}</h4>
      { children }
      <br />
      { errors ? <div><br /><span>Validation fail: {errors}</span><br /></div> : <div /> }
      { completed ? 
        <h5>Wizard complete!</h5> 
          :
            <div />
       }
      <button onClick={reset}>Reset</button>
      <br />
      <div>
        { 
          hasPrevious ? 
            <button className="reset" onClick={onPreviousClicked} style={{float: 'left'}}>Previous</button>
            :
              <div />
         }
         {
           hasNext ?
             <button className="next" onClick={() => onNextClicked().then(() => {}, () => {})} style={{float: 'right'}}>Next</button>
            :
              <button className="complete" onClick={() => { onNextClicked().then(onComplete, (err) => {}); }} style={{float: 'right'}}>Send</button>
        }

      </div>
    </div>
  );
}

export function WizardExample5 (props) {
  return (
    <Wizard
      onComplete={values => { alert(`Wizard complete: \n ${JSON.stringify(values)}`); }}
      promiseOnNext
      {...props}
      >
      <PlainInput
        id='singlestep'
        title='Single step'
        description='Write anything'
        initialValue=''
        validate={value => { if (!value) { throw 'Say sth'; } }}
      />
    </Wizard>
  );
}
