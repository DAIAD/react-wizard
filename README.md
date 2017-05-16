# react-wiz

A general purpose wizard component creator for React. <br><br>

Check out the live demo [here](https://smanousopoulos.github.io/react-wizard/)

A creator function is exported that takes a pure react component to wrap each wizard step as an optional argument and returns a component class to be used as the wizard. The Component handles wizard logic and rendering is left to the user for flexibility.

## Installation
    npm install --save https://github.com/DAIAD/react-wizard.git
    
## Usage

The wizard accepts the following options

| Option | Type | Description |
| -------- | ---- | ----------- |
| onComplete | func | onComplete callback function to execute |
| promiseOnNext | bool | option to return promise in onNextClicked function |
| validateLive | bool | option to validate on user-input, otherwise only on next |
| children | oneOfType([<br>arrayOf(element), <br> object]).isRequired | wizard step components |


Each child passed to Wizard must be a React Component that handles the rendering and interaction of the relative step. Each child accepts the following options


| Option | Type | Description |
| -------- | ---- | ----------- |
| id | string.isRequired | required id. *Note that id = 'complete' is reserved* |
| title | string | title of the step. Useful when a component wrapper is provided
| description | string | description of the step. Useful when a component wrapper is provided |
| initialValue | any.isRequired | initialValue required to define return value expected type |
| validate | func | function to validate input of the step. Must throw string ex. value => !value ? throw 'Error' : null |
| next | func | The next function that allows changing the default flow of the wizard based on the value provided. Default next returns the next item. ex. value => value == 1 ? 'id1' : 'id2' |
  
  
The following properties are passed down to each component and wrapper component (if provided) for full control of each step

| Property | Type | Description |
| -------- | ---- | ----------- |
|  onNextClicked |  func | next click handler |
|  onPreviousClicked | func | previous click handler |
|  onComplete | func | on complete handler that executes the provided onComplete callback function with values object and sets wizard as completed, ex. values => handleValues(values) |
|  reset | func | reset handler |
|  setValue | func | the callback function to set the wizard item value, ex. () => setValue('check'), or setValue([1,2,3]), or setValue({a:1, b:2}) |
|  value | any | the value set by setValue (initially initialValue) |
|  values | object | the cleared wizard values with wizard items ids as keys, ex. {'step1': 'check', 'step2': [1,2,3]} | 
|  errors | string | any validation errors |
|  completed | bool | is wizard complete |
|  step | number | the wizard step count |
|  isActive | bool | is wizard item active (by default only active is displayed) |
|  isLast | bool | is the last wizard item |
|  hasNext | bool | wizard item has next |
|  hasPrevious | bool | wizard item has previous |

All types are React PropTypes https://facebook.github.io/react/docs/typechecking-with-proptypes.html


## Example

A simple wizard example is shown here

    import createWizard from 'react-wiz';
    
    const Wizard = createWizard();
    
    function Step1 (props) {
      const { value, setValue, errors, onNextClicked } = props;
      return (
        <div>
          <h3>Hello world</h3>
          <p>Write your name</p>
          <input onChange={e => setValue(e.target.value)} placeholder="Input" value={value} />
          { errors ? <div><br /><span>Validation fail: {errors}</span></div> : <div /> }
          <button onClick={onNextClicked} style={{float: 'right'}}>Next</button>
        </div>
      );
    }

    function Step2 (props) {
      const { values, onPreviousClicked, onComplete } = props;
      return (
        <div>
          <p>Are you sure you want to submit, {values.name ? values.name.values : ''}?</p>
          <button onClick={onPreviousClicked} style={{float: 'left'}}>Previous</button>
          <button onClick={onComplete} style={{float: 'right'}}>Submit</button>
        </div>
      );
    }

    function WizardExample (props) {
      return (
        <Wizard
          onComplete={values => { alert(`Wizard complete: \n ${JSON.stringify(values)}`); }}
        >
            <Step1
              id='name'
              initialValue=''
              validate={value => { if (!value) { throw 'No name provided'; } }}
            />
            <Step2
              id='confirm'
            />
        </Wizard>


For more examples: 
    
    NODE_HOST=localhost NODE_PORT=3000 npm run example

Requires node >= 4.3.2
