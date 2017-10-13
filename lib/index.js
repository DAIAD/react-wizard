'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactAddonsShallowCompare = require('react-addons-shallow-compare');

var _reactAddonsShallowCompare2 = _interopRequireDefault(_reactAddonsShallowCompare);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var defaultNext = function defaultNext(children, idx) {
  return function () {
    if (children[idx + 1]) {
      return children[idx + 1].props.id;
    } else {
      return 'complete';
    }
  };
};

var defaultValidate = function defaultValidate() {};

var defaultOnComplete = function defaultOnComplete() {
  return function (values) {
    console.log('completed:', values);
  };
};

var defaultOnValidationFail = function defaultOnValidationFail() {
  return function (err) {
    console.error(err);
  };
};

var createWizard = function createWizard() {
  var WizardItemWrapper = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

  var Wizard = function (_React$Component) {
    _inherits(Wizard, _React$Component);

    function Wizard(props) {
      _classCallCheck(this, Wizard);

      var _this = _possibleConstructorReturn(this, (Wizard.__proto__ || Object.getPrototypeOf(Wizard)).call(this, props));

      var children = props.children;

      if (!children) throw new Error('No wizard items specified. Check Wizard');

      _this.wizardItems = _react2.default.Children.toArray(_react2.default.Children.map(children, function (Child, idx) {
        if (!Child.props.id) {
          throw new Error('Each wizard child must have an id property. ' + ('Check ' + Child.type.name + ' wizard item'));
        };

        var WizardItem = createWizardItem(Child.type, WizardItemWrapper);

        return _react2.default.createElement(WizardItem, _extends({
          next: defaultNext(children, idx),
          validate: defaultValidate
        }, _this.props.childrenProps, Child.props, {
          onNextClicked: _this._onNextClicked.bind(_this),
          onPreviousClicked: _this._onPreviousClicked.bind(_this),
          onGoToId: _this._onGoToId.bind(_this),
          onComplete: _this._onComplete.bind(_this),
          reset: _this._reset.bind(_this),
          submitItem: _this._setItemValues.bind(_this),
          getClearedValues: _this._getClearedValues.bind(_this)
        }));
      }));

      _this.onComplete = props.onComplete ? props.onComplete : defaultOnComplete;

      _this.state = _this._getInitialState();
      return _this;
    }

    //helper get functions


    _createClass(Wizard, [{
      key: '_getInitialState',
      value: function _getInitialState() {
        var first = this.wizardItems[0].props.id;
        var values = this._getInitialValues();

        return {
          active: this.props.initialActive || first,
          cleared: this.props.initialActive && this._getPath(first, this.props.initialActive, values) || [],
          values: values,
          completed: false,
          errors: {}
        };
      }
    }, {
      key: '_getInitialValues',
      value: function _getInitialValues() {
        var _this2 = this;

        return this.wizardItems.reduce(function (p, c) {
          var d = _extends({}, p);
          var initialValue = c.props.initialValue != null ? c.props.initialValue : _this2.props.initialValues && _this2.props.initialValues[c.props.id];

          if (initialValue == null) {
            throw new Error('Wizard: No initialValue set for ' + c.props.id + '.' + 'You can either provide initialValue as step prop or all initialValues as Wizard Component prop');
          }

          d[c.props.id] = initialValue;
          return d;
        }, {});
      }
    }, {
      key: '_getClearedValues',
      value: function _getClearedValues() {
        return (0, _utils.filterObjByKeys)(this.state.values, this.state.cleared);
      }
    }, {
      key: '_getActiveWizardItem',
      value: function _getActiveWizardItem() {
        return this._getWizardItem(this.state.active);
      }
    }, {
      key: '_getWizardItem',
      value: function _getWizardItem(id) {
        return this.wizardItems.find(function (item) {
          return item.props.id === id;
        });
      }
    }, {
      key: '_getIndexById',
      value: function _getIndexById(id) {
        return this.wizardItems.findIndex(function (it) {
          return it.props.id === id;
        });
      }
    }, {
      key: '_getPath',
      value: function _getPath(from, to, values) {
        if (!to || !(to in _extends({}, values, { complete: null }))) {
          throw new Error('Wizard: No path to \'' + to + '\'. Check initialActive prop');
        };
        var path = [];

        var current = from;
        var step = this._getWizardItem(current);

        while (current !== to) {
          path.push(current);
          step = this._getWizardItem(current);
          if (!step || !step.props) {
            throw new Error('Wizard: No path to \'' + to + '\'. Check initialActive prop and initialValues');
          }
          current = step.props.next(values[current]);
        }
        return path;
      }
    }, {
      key: '_getSteps',
      value: function _getSteps() {
        var _this3 = this;

        var path = this._getPath(this.wizardItems[0].props.id, 'complete', this.state.values);
        return path.map(function (id, idx) {
          return {
            id: id,
            index: idx,
            title: _this3._getWizardItem(id).props.title,
            cleared: _this3.state.cleared.find(function (it) {
              return it === id;
            }) ? true : false,
            active: _this3._isActive(id)
          };
        });
      }
    }, {
      key: '_isActive',
      value: function _isActive(id) {
        return this.state.active === id;
      }

      //set state functions

    }, {
      key: '_reset',
      value: function _reset() {
        this.setState(this._getInitialState());
      }
    }, {
      key: '_setCompleted',
      value: function _setCompleted() {
        this.setState({ completed: true });
      }
    }, {
      key: '_resetCompleted',
      value: function _resetCompleted() {
        this.setState({ completed: false });
      }
    }, {
      key: '_setValidationFail',
      value: function _setValidationFail(id, error) {
        var newErrors = _extends({}, this.state.errors);
        newErrors[id] = error;
        this.setState({ errors: newErrors });
      }
    }, {
      key: '_setValidationClear',
      value: function _setValidationClear(id) {
        if (this.state.errors[id] == null) return;

        var newErrors = _extends({}, this.state.errors);
        newErrors[id] = null;
        this.setState({ errors: newErrors });
      }
    }, {
      key: '_setItemValues',
      value: function _setItemValues(id, value) {
        var validateLive = this.props.validateLive;

        var item = this._getWizardItem(id);

        var newValues = _extends({}, this.state.values);
        newValues[id] = value;
        this.setState({ values: newValues });

        if (validateLive) {
          this._validate(id, value).catch(function (err) {
            //just catch error 
          });
        }
      }
    }, {
      key: '_pushCleared',
      value: function _pushCleared(id) {
        if (this.state.cleared[this.state.cleared.length - 1] === id) return;
        this.setState({ cleared: [].concat(_toConsumableArray(this.state.cleared), [id]) });
      }
    }, {
      key: '_popCleared',
      value: function _popCleared() {
        var cleared = [].concat(_toConsumableArray(this.state.cleared));
        var last = cleared.pop();
        this.setState({ cleared: cleared });
        return last;
      }
    }, {
      key: '_popUntilId',
      value: function _popUntilId(id) {
        var idx = this.state.cleared.findIndex(function (c) {
          return c === id;
        });
        var last = this.state.cleared[idx];
        if (idx !== -1) {
          var cleared = this.state.cleared.slice(0, idx);
          this.setState({ cleared: cleared });
        }
        return last;
      }
    }, {
      key: '_setActiveById',
      value: function _setActiveById(id) {
        if (id == null || id === 'complete') return;

        this.setState({ active: id });
      }

      //handle event functions

    }, {
      key: '_validate',
      value: function _validate(id, value) {
        var _this4 = this;

        var item = this._getWizardItem(id);
        var validate = item.props.validate;

        return Promise.resolve().then(function () {
          return validate(value);
        }).then(function () {
          _this4._setValidationClear(id);return value;
        }).catch(function (err) {
          _this4._setValidationFail(id, err);throw err;
        });
      }
    }, {
      key: '_onComplete',
      value: function _onComplete() {
        var cleared = this._getClearedValues();
        this.onComplete(cleared);
        this._setCompleted();
      }
    }, {
      key: '_onNextClicked',
      value: function _onNextClicked() {
        var _this5 = this;

        var promiseOnNext = this.props.promiseOnNext;

        var active = this._getActiveWizardItem();
        var _active$props = active.props,
            id = _active$props.id,
            next = _active$props.next,
            validate = _active$props.validate;

        var value = this.state.values[id];

        return this._validate(id, value).then(function (value) {
          _this5._pushCleared(id);
          _this5._setActiveById(next(value));
          return value;
        }, function (err) {
          if (promiseOnNext) {
            // if promise on next prop, rethrow and let user handle
            throw err;
          }
        });
      }
    }, {
      key: '_onPreviousClicked',
      value: function _onPreviousClicked() {
        var active = this._getActiveWizardItem();
        var _active$props2 = active.props,
            id = _active$props2.id,
            next = _active$props2.next,
            validate = _active$props2.validate;


        var cleared = this._popCleared();
        if (!cleared) return;

        this._setValidationClear(id);
        this._setActiveById(cleared);

        if (this.state.completed) {
          this._resetCompleted();
        }
      }
    }, {
      key: '_onGoToId',
      value: function _onGoToId(id) {
        var last = this._popUntilId(id);

        if (this.state.cleared.includes(id)) {
          this._setActiveById(id);
        }
      }
    }, {
      key: 'render',
      value: function render() {
        var _this6 = this;

        var _state = this.state,
            cleared = _state.cleared,
            values = _state.values,
            errors = _state.errors,
            completed = _state.completed;

        var steps = this._getSteps();
        return _react2.default.createElement(
          'div',
          null,
          _react2.default.Children.map(this.wizardItems, function (Component, idx) {
            var _Component$props = Component.props,
                id = _Component$props.id,
                next = _Component$props.next;

            var value = values[id];
            var error = errors[id];
            var Child = _react2.default.Children.toArray(_this6.props.children).find(function (c, cidx) {
              return cidx === idx;
            });
            return _react2.default.createElement(Component.type, _extends({
              key: id,
              completed: completed,
              isActive: _this6._isActive(id),
              isLast: next(value) === 'complete',
              hasNext: next(value) !== 'complete' && next(value) != null,
              hasPrevious: cleared.length > 0,
              value: value,
              errors: error,
              step: steps.find(function (s) {
                return s.active;
              }),
              steps: steps
            }, _this6.props.childrenProps, Component.props, Child.props));
          })
        );
      }
    }]);

    return Wizard;
  }(_react2.default.Component);

  ;

  Wizard.defaultProps = {
    promiseOnNext: false,
    validateLive: false,
    childrenProps: {},
    initialValues: {}
  };

  Wizard.propTypes = {
    onComplete: _react2.default.PropTypes.func, //onComplete callback function to execute
    promiseOnNext: _react2.default.PropTypes.bool, //option to return promise in onNextClicked function
    validateLive: _react2.default.PropTypes.bool, //option to validate on user-input, otherwise only on next
    initialActive: _react2.default.PropTypes.string, // pass step id to start from step other than first. 
    initialValues: _react2.default.PropTypes.object, // alternative way to pass initialValues for children
    childrenProps: _react2.default.PropTypes.object, //pass extra properties to all children
    children: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.arrayOf(_react2.default.PropTypes.element), _react2.default.PropTypes.object]).isRequired
  };

  return Wizard;
};

var createWizardItem = function createWizardItem(WizardItemInner, WizardItemWrapper) {

  var _renderWithWrapper = function _renderWithWrapper(props) {
    if (!props.isActive) return null;
    return _react2.default.createElement(
      WizardItemWrapper,
      props,
      _react2.default.createElement(WizardItemInner, props)
    );
  };

  var _renderWithoutWrapper = function _renderWithoutWrapper(props) {
    if (!props.isActive) return null;
    return _react2.default.createElement(WizardItemInner, props);
  };

  var renderWizardItem = WizardItemWrapper != null ? _renderWithWrapper : _renderWithoutWrapper;

  var WizardItem = function (_React$Component2) {
    _inherits(WizardItem, _React$Component2);

    function WizardItem(props) {
      _classCallCheck(this, WizardItem);

      var _this7 = _possibleConstructorReturn(this, (WizardItem.__proto__ || Object.getPrototypeOf(WizardItem)).call(this, props));

      _this7.renderWizardItem = renderWizardItem.bind(_this7);
      return _this7;
    }

    _createClass(WizardItem, [{
      key: 'shouldComponentUpdate',
      value: function shouldComponentUpdate(nextProps, nextState) {
        if (this.props.isActive || nextProps.isActive) {
          return (0, _reactAddonsShallowCompare2.default)(this, nextProps, nextState);
        }
        return false;
      }
    }, {
      key: '_setValue',
      value: function _setValue(value) {
        this.props.submitItem(this.props.id, value);
      }
    }, {
      key: 'render',
      value: function render() {
        var props = _extends({}, this.props, {
          values: this.props.getClearedValues(),
          setValue: this._setValue.bind(this)
        });
        return this.renderWizardItem(props);
      }
    }]);

    return WizardItem;
  }(_react2.default.Component);

  ;

  WizardItem.propTypes = {
    id: _react2.default.PropTypes.string.isRequired, // id is required
    title: _react2.default.PropTypes.string,
    description: _react2.default.PropTypes.string,
    initialValue: _react2.default.PropTypes.any, //initialValue defines return value expected type
    validate: _react2.default.PropTypes.func, // ex. value => !value ? throw 'Error' : null
    next: _react2.default.PropTypes.func // ex. value => value == 1 ? 'id1' : 'id2'
  };

  return WizardItem;
};

//provided to render wrapper (if provided) and each component 
var renderPropTypes = {
  onNextClicked: _react2.default.PropTypes.func, //next click handler
  onPreviousClicked: _react2.default.PropTypes.func, //previous clicked handler
  onComplete: _react2.default.PropTypes.func, //on complete handler with values object, ex. values => handleValues(values)
  reset: _react2.default.PropTypes.func, //reset handler
  setValue: _react2.default.PropTypes.func, //the callback function to set the wizard item value, ex. () => setValue('check'), or setValue([1,2,3]), or setValue({a:1, b:2})
  value: _react2.default.PropTypes.any, //the value set by setValue (initially initialValue)
  values: _react2.default.PropTypes.object, //the cleared wizard values as a dict with wizard items ids as keys, ex. {'step1': 'check', 'step2': [1,2,3]}, 
  errors: _react2.default.PropTypes.string, //any validation errors
  completed: _react2.default.PropTypes.bool, //wizard completed
  step: _react2.default.PropTypes.number, // the wizard step based on how many next clicked
  isActive: _react2.default.PropTypes.bool, //is wizard item active (by default only active is displayed)
  isLast: _react2.default.PropTypes.bool, //is last wizard item
  hasNext: _react2.default.PropTypes.bool, //wizard item has next
  hasPrevious: _react2.default.PropTypes.bool //wizard item has previous
};

module.exports = createWizard;