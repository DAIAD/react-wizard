import React from 'react';
import PropTypes from 'prop-types';
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
      if (!children) throw new Error(`No wizard items specified. Check Wizard`);

      this.wizardItems = React.Children.toArray(React.Children.map(children, ((Child, idx) => {
        if (!Child.props.id) { 
          throw new Error(`Each wizard child must have an id property. `+
                `Check ${Child.type.name} wizard item`);
        };

        const WizardItem = createWizardItem(Child.type, WizardItemWrapper);

        return React.createElement(WizardItem, {
          next: defaultNext(children, idx),
          validate: defaultValidate,
          ...this.props.childrenProps,
          ...Child.props, 
          onNextClicked: this._onNextClicked.bind(this),
          onPreviousClicked: this._onPreviousClicked.bind(this),
          onGoToId: this._onGoToId.bind(this),
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
      const first = this.wizardItems[0].props.id;
      const values = this._getInitialValues();

      return {
        active: this.props.initialActive || first,
        cleared: this.props.initialActive && this._getPath(first, this.props.initialActive, values) || [],
        values,
        completed: false,
        errors: {}
      };
    }

    _getInitialValues() {
      return this.wizardItems.reduce((p, c) => {
        const d = {...p};
        const initialValue = c.props.initialValue != null ? 
          c.props.initialValue 
            : (this.props.initialValues && this.props.initialValues[c.props.id]); 

        if (initialValue == null) {
          throw new Error(`Wizard: No initialValue set for ${c.props.id}.` + 
                          `You can either provide initialValue as step prop or all initialValues as Wizard Component prop`);
        }

        d[c.props.id] = initialValue;
        return d;
      }, {});
    }

    _getClearedValues() {
      return filterObjByKeys(this.state.values, this.state.cleared);
    }
    
    _getActiveWizardItem() {
      return this._getWizardItem(this.state.active);
    }
    
    _getWizardItem(id) {
      return this.wizardItems.find(item => item.props.id === id);
    }

    _getIndexById(id) {
      return this.wizardItems.findIndex(it => it.props.id === id);
    }

    _getPath(from, to, values) {
      if (!to || !(to in {...values, complete: null })) { 
        throw new Error(`Wizard: No path to '${to}'. Check initialActive prop`);
      };
      const path = [];

      let current = from;
      let step = this._getWizardItem(current);

      while(current !== to) {
        path.push(current);
        step = this._getWizardItem(current);
        if (!step || !step.props) {
          throw new Error(`Wizard: No path to '${to}'. Check initialActive prop and initialValues`);
        }
        current = step.props.next(values[current]);
      }
      return path;
    }

    _getSteps() {
      const path = this._getPath(this.wizardItems[0].props.id, 'complete', this.state.values);
      return path.map((id, idx) => ({
        id: id,
        index: idx,
        title: this._getWizardItem(id).props.title,
        cleared: this.state.cleared.find(it => it === id) ? true : false,
        active: this._isActive(id),
      }));
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
        .catch((err) => { 
          //just catch error 
        });
      }
    }

    _pushCleared(id) {
      if (this.state.cleared[this.state.cleared.length-1] === id) return;
      this.setState({ cleared: [...this.state.cleared, id] });
    }

    _popCleared() {
      const cleared = [...this.state.cleared];
      const last = cleared.pop();
      this.setState({ cleared });
      return last;
    }

    _popUntilId(id) {
      const idx = this.state.cleared.findIndex(c => c === id);
      const last = this.state.cleared[idx];
      if (idx !== -1) {
        const cleared = this.state.cleared.slice(0, idx);
        this.setState({ cleared });
      }
      return last;
    }

    _setActiveById(id) {
      if (id == null || id === 'complete') return;

      this.setState({ active: id });
    }
    
    //handle event functions
    _validate(id, value) {
      const item = this._getWizardItem(id);
      const { validate } = item.props;
      return Promise.resolve()
      .then(() => validate(value, this._getClearedValues()))
      .then(() => { this._setValidationClear(id); return value; })
      .catch((err) => { this._setValidationFail(id, err); throw err; });
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
 
      return this._validate(id, value)
      .then((value) => { 
        this._pushCleared(id);
        this._setActiveById(next(value));
        return value;
      },
      (err) => {
        if (promiseOnNext) {
          // if promise on next prop, rethrow and let user handle
          throw err;
        }
      });
    }

    _onPreviousClicked() {
      const active = this._getActiveWizardItem();
      const { id, next, validate } = active.props;

      const cleared = this._popCleared();
      if (!cleared) return;

      this._setValidationClear(id);
      this._setActiveById(cleared);
      
      if (this.state.completed) {
        this._resetCompleted();
      }
    }

    _onGoToId(id) {
      const last = this._popUntilId(id);

      if (this.state.cleared.includes(id)) {
        this._setActiveById(id);
      }

    }
  
    render() {
      const { cleared, values, errors, completed } = this.state;
      const steps = this._getSteps();
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
                hasPrevious={cleared.length > 0}
                value={value}
                errors={error}
                step={steps.find(s => s.active)}
                steps={steps}
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
    childrenProps: {},
    initialValues: {},
  };

  Wizard.propTypes = {
    onComplete: PropTypes.func, //onComplete callback function to execute
    promiseOnNext: PropTypes.bool, //option to return promise in onNextClicked function
    validateLive: PropTypes.bool, //option to validate on user-input, otherwise only on next
    initialActive: PropTypes.string, // pass step id to start from step other than first. 
    initialValues: PropTypes.object, // alternative way to pass initialValues for children
    childrenProps: PropTypes.object, //pass extra properties to all children
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.element), 
      PropTypes.object
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
    id: PropTypes.string.isRequired, // id is required
    title: PropTypes.string,
    description: PropTypes.string,
    initialValue: PropTypes.any, //initialValue defines return value expected type
    validate: PropTypes.func, // ex. value => !value ? throw 'Error' : null
    next: PropTypes.func, // ex. value => value == 1 ? 'id1' : 'id2'
  };

  return WizardItem;
}

//provided to render wrapper (if provided) and each component 
const renderPropTypes = {
  onNextClicked: PropTypes.func, //next click handler
  onPreviousClicked: PropTypes.func, //previous clicked handler
  onComplete: PropTypes.func, //on complete handler with values object, ex. values => handleValues(values)
  reset: PropTypes.func, //reset handler
  setValue: PropTypes.func, //the callback function to set the wizard item value, ex. () => setValue('check'), or setValue([1,2,3]), or setValue({a:1, b:2})
  value: PropTypes.any, //the value set by setValue (initially initialValue)
  values: PropTypes.object, //the cleared wizard values as a dict with wizard items ids as keys, ex. {'step1': 'check', 'step2': [1,2,3]}, 
  errors: PropTypes.string, //any validation errors
  completed: PropTypes.bool, //wizard completed
  step: PropTypes.number, // the wizard step based on how many next clicked
  isActive: PropTypes.bool, //is wizard item active (by default only active is displayed)
  isLast: PropTypes.bool, //is last wizard item
  hasNext: PropTypes.bool, //wizard item has next
  hasPrevious: PropTypes.bool, //wizard item has previous
};


module.exports = createWizard;
