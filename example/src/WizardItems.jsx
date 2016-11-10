import React from 'react';

export const PlainInput = ({ setValue, value}) => {
  return (
    <input onChange={e => setValue(e.target.value, e.target.value)} placeholder="Input" value={value} />
  );
}

export const PlainRadio = ({ setValue, value, options }) => {
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

export const PlainCheckboxes = ({ setValue, value, options }) => {
  return (
    <ul>
      {
        options.map(option => 
           <li key={option}>
             <label>
               <input 
                 type="checkbox" 
                 id={option} 
                 value={option} 
                 checked={value.find(v => v === option) || false} 
                 onChange={e => 
                   e.target.checked ? 
                     setValue([...value, e.target.value]) 
                       : 
                         setValue([...value.filter(v => v != e.target.value)])
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

export const Fork = ({ setValue, value }) => {
  const options = ['colors', 'finish'];
  return (
    <PlainRadio {...{setValue, value, options}} />  
  );
}

export const SelectColors = ({ setValue, value }) => {
  const options = ['blue', 'red', 'purple', 'orange', 'green'];
  return (
    <PlainCheckboxes {...{ setValue, value, options }} />
  );
}

export const ConfirmColors = ({ setValue, value, values }) => {
  const name = values.name ? values.name.values : '';
  const colors = values.colors ? values.colors.values : null;
  return (
    <div>
      {
        colors == null ? 
          <span>You were too bored to pick colors</span>
          :
            <span><i>{name}</i> are you sure your favorite colors are: <b>{colors.join(', ')}</b> ?</span>
       }
  </div>
  );
}
