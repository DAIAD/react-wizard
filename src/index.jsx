import React from 'react';
import shallowCompare from 'react-addons-shallow-compare';

import { filterObjByKeys } from './utils';

const defaultNext = (children, idx) => () => { 
  if (children[idx+1]) { 
    return children[idx+1].props.id; 
  } 
  else { 
    return 'complete'; 
  }
}

const defaultValidate = () => {}

const defaultOnComplete = () => (values) => {
  console.log('completed:', values);
}

const defaultOnValidationFail = () => (err) => {
  console.error(err);
}

const createWizard = (WizardItemWrapper=null) => {

  class Wizard extends React.Component {

    constructor(props) {
      super(props);
      
      const { children } = props;
      if (!children) throw `No wizard items specified. Check Wizard`;

      this.wizardItems = React.Children.toArray(React.Children.map(children, ((Child, idx) => {
        if (!Child.props.id) { 
          throw `Each wizard child must have an id property. `+
                `Check ${Child.type.name} wizard item`;
        };

        const WizardItem = createWizardItem(Child.type, WizardItemWrapper);

        return React.createElement(WizardItem, {
          next: defaultNext(children, idx),
          validate: defaultValidate,
          ...this.props.childrenProps,
          ...Child.props, 
          onNextClicked: this._onNextClicked.bind(this),
          onPreviousClicked: this._onPreviousClicked.bind(this),
          onComplete: this._onComplete.bind(this),
          reset: this._reset.bind(this),
          submitItem: this._setItemValues.bind(this), 
          getClearedValues: this._getClearedValues.bind(this)
        });
      })));
      
      this.onComplete = props.onComplete ? props.onComplete : defaultOnComplete;
      
      this.state = this._getInitialState();
    } 

    //helper get functions
    _getInitialState() {
      return {
        active: this.wizardItems[0].props.id,
        previous: [],
        values: this._getInitialValues(),
        completed: false,
        errors: {}
      };
    }

    _getInitialValues() {
      return this.wizardItems.reduce((p, c) => {
        const d = {...p};
        d[c.props.id] = c.props.initialValue; 
        return d;
      }, {});
    }

    _getClearedValues() {
      return filterObjByKeys(this.state.values, this.state.previous);
    }
    
    _getActiveWizardItem() {
      return this._getWizardItem(this.state.active);
    }
    
    _getWizardItem(id) {
      return this.wizardItems.find(item => item.props.id === id);
    }

    _isActive(id) {
      return this.state.active === id;
    }
    
    //set state functions
    _reset() {
      this.setState(this._getInitialState());
    }
    
    _setCompleted() {
      this.setState({ completed: true });
    }

    _resetCompleted() {
      this.setState({ completed: false });
    }

    _setValidationFail(id, error) {
      const newErrors = {...this.state.errors};
      newErrors[id] = error;
      this.setState({ errors: newErrors });
    }

    _setValidationClear(id) {
      if (this.state.errors[id] == null) return;

      const newErrors = {...this.state.errors};
      newErrors[id]=null;
      this.setState({ errors: newErrors });
    }
    
    _setItemValues(id, value) {
      const { validateLive } = this.props;
      const item = this._getWizardItem(id);
      
      const newValues = {...this.state.values};
      newValues[id] = value;
      this.setState({ values: newValues });

      if (validateLive) {
        this._validate(id, value)
        .then(() => {
          this._setValidationClear(id);
        },
        (err) => {
          this._setValidationFail(id, err);
        });
      }
    }

    _pushPrevious(id) {
      if (this.state.previous[this.state.previous.length-1] === id) return;
      this.setState({ previous: [...this.state.previous, id] });
    }

    _popPrevious() {
      this.setState({ previous: this.state.previous.filter((x, i, arr) => i < arr.length-1) });
      return this.state.previous.find((x,i,arr) => i === arr.length-1);
    }

    _setActiveById(id) {
      if (id == null || id === 'complete') return;

      this.setState({ active: id });
    }

    //handle event functions
    _validate(id, value) {
      const item = this._getWizardItem(id);
      const { validate } = item.props;
      
      try {
         validate(value);
         return Promise.resolve(value); 
      }
      catch(err) {
        return Promise.reject(err);
      }
    }

    _onComplete() {
      const cleared = this._getClearedValues();
      this.onComplete(cleared);
      this._setCompleted();
    } 
    
    _onNextClicked() {
      const { promiseOnNext } = this.props;
      const active = this._getActiveWizardItem();
      const { id, next, validate } = active.props;
      const value = this.state.values[id];
 
      const promise = this._validate(id, value)
      .then((value) => { 
        this._pushPrevious(id);
      
        this._setActiveById(next(value));
        this._setValidationClear(id);

        return value;
      },
      (err) => {
        this._setValidationFail(id, err);
        if (promiseOnNext) {
          throw err;
        }
      });

      if (promiseOnNext) {
        return promise;
      }
    }

    _onPreviousClicked() {
      const active = this._getActiveWizardItem();
      const { id, next, validate } = active.props;

      const previous = this._popPrevious();
      if (!previous) return;

      this._setValidationClear(id);
      this._setActiveById(previous);
      
      if (this.state.completed) {
        this._resetCompleted();
      }
    }
  
    render() {
      const { previous, values, errors, completed } = this.state;
      return (
        <div>
        {
          React.Children.map(this.wizardItems, ((Component, idx) => {
            const { id, next } = Component.props;
            const value = values[id];
            const error = errors[id];
            const Child = React.Children.toArray(this.props.children).find((c, cidx) => cidx === idx);
            return (
              <Component.type
                key={id}
                completed={completed}
                isActive={this._isActive(id)}
                isLast={next(value) === 'complete'}
                hasNext={next(value) !== 'complete' && next(value) != null}
                hasPrevious={previous.length > 0}
                value={value}
                errors={error}
                step={previous.length+1}
                {...this.props.childrenProps}
                {...Component.props}
                {...Child.props}
              />
            );
          }))
        }
        </div>
      );
    }
  };

  Wizard.defaultProps = {
    promiseOnNext: false,
    validateLive: false,
    childrenProps: {}
  };

  Wizard.propTypes = {
    onComplete: React.PropTypes.func, //onComplete callback function to execute
    promiseOnNext: React.PropTypes.bool, //option to return promise in onNextClicked function
    validateLive: React.PropTypes.bool, //option to validate on user-input, otherwise only on next
    childrenProps: React.PropTypes.object, //pass extra properties to all children
    children: React.PropTypes.oneOfType([
      React.PropTypes.arrayOf(React.PropTypes.element), 
      React.PropTypes.object
    ]).isRequired
  };

  return Wizard;
}
  
const createWizardItem = (WizardItemInner, WizardItemWrapper) => {
  
  const _renderWithWrapper = function(props) {
    if (!props.isActive) return null;
    return (
      <WizardItemWrapper
        {...props} 
      >
        <WizardItemInner
          {...props} 
        />
    </WizardItemWrapper>
    );
  };
  
  const _renderWithoutWrapper = function(props) {
    if (!props.isActive) return null;
    return (
      <WizardItemInner
        {...props}
      />
    );
  };

  const renderWizardItem = WizardItemWrapper != null ? _renderWithWrapper : _renderWithoutWrapper;

  class WizardItem extends React.Component {
    constructor(props) {
      super(props);
      this.renderWizardItem = renderWizardItem.bind(this); 
    }

    shouldComponentUpdate (nextProps, nextState) {
      if (this.props.isActive || nextProps.isActive) {
        return shallowCompare(this, nextProps, nextState);
      }
      return false;
    }

    _setValue(value) {
      this.props.submitItem(this.props.id, value);
    }

    render() {
      const props = {
        ...this.props,
        values: this.props.getClearedValues(),
        setValue: this._setValue.bind(this),
      };
      return this.renderWizardItem(props);
    }
  };
  
  WizardItem.propTypes = {
    id: React.PropTypes.string.isRequired, // id is required
    title: React.PropTypes.string,
    description: React.PropTypes.string,
    initialValue: React.PropTypes.any.isRequired, //initialValue required to define return value expected type
    validate: React.PropTypes.func, // ex. value => !value ? throw 'Error' : null
    next: React.PropTypes.func, // ex. value => value == 1 ? 'id1' : 'id2'
  };

  return WizardItem;
}

//provided to render wrapper (if provided) and each component 
const renderPropTypes = {
  onNextClicked: React.PropTypes.func, //next click handler
  onPreviousClicked: React.PropTypes.func, //previous clicked handler
  onComplete: React.PropTypes.func, //on complete handler with values object, ex. values => handleValues(values)
  reset: React.PropTypes.func, //reset handler
  setValue: React.PropTypes.func, //the callback function to set the wizard item value, ex. () => setValue('check'), or setValue([1,2,3]), or setValue({a:1, b:2})
  value: React.PropTypes.any, //the value set by setValue (initially initialValue)
  values: React.PropTypes.object, //the cleared wizard values as a dict with wizard items ids as keys, ex. {'step1': 'check', 'step2': [1,2,3]}, 
  errors: React.PropTypes.string, //any validation errors
  completed: React.PropTypes.bool, //wizard completed
  step: React.PropTypes.number, // the wizard step based on how many next clicked
  isActive: React.PropTypes.bool, //is wizard item active (by default only active is displayed)
  isLast: React.PropTypes.bool, //is last wizard item
  hasNext: React.PropTypes.bool, //wizard item has next
  hasPrevious: React.PropTypes.bool, //wizard item has previous
};


module.exports = createWizard;
