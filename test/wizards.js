import React from 'react';
import 'babel-polyfill';

import chai from 'chai';
import { assert, expect } from 'chai';
import chaiEnzyme from 'chai-enzyme';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);
chai.use(chaiEnzyme());

import { WizardExample1, WizardExample2, WizardExample3, WizardExample4 } from '../example/src/examples';

import { delay } from './delay';

const logComplete = (values) => { console.log('Wizard complete: \n', values); };

[
  { name: 'wizard without wrapper', component: WizardExample1 },
  { name: 'wizard with wrapper', component: WizardExample2 }
].forEach(example => { 
  describe(example.name, function() {
    it('should complete successfully', function(done) {
      const onComplete = sinon.spy(logComplete);
      const wrapper = mount(example.component({ onComplete }));
      
      expect(wrapper.state('errors').name).to.not.exist;

      wrapper.find('.next').simulate('click');
      expect(wrapper.state('errors').name).to.equal('No noname');
      wrapper.find('input').simulate('change', { target: { value: 'asd' }});
      expect(wrapper.state('values').name).to.equal('asd');

      wrapper.find('.next').simulate('click');

      delay(() => {
        expect(wrapper.state('cleared')).contains('name');
        expect(wrapper.state('active')).to.equal('colors');

        wrapper.find('.next').simulate('click');
        expect(wrapper.state('errors').colors).to.equal('Select at least one');
        wrapper.find('#blue').simulate('change', { target: { checked: true, value: 'blue' }});
        wrapper.find('#green').simulate('change', { target: { checked: true, value: 'green' }});
        wrapper.find('.next').simulate('click');
        expect(wrapper.state('errors').colors).to.not.exist;
        expect(wrapper.state('values').colors).includes.members(['blue', 'green']);
        wrapper.find('.next').simulate('click');
      },  1)
      .delay(() => {
        expect(wrapper.state('cleared')).includes.members(['name', 'colors']);
        expect(wrapper.state('active')).to.equal('confirm');
        wrapper.find('.complete').simulate('click');
        expect(wrapper.state('completed')).to.equal(true);
        expect(wrapper.state('values')).to.deep.equal({name: 'asd', colors: ['blue', 'green'], confirm: '' });
        expect(onComplete).to.be.calledOnce;
        expect(onComplete.calledWith({name: 'asd', colors: ['blue', 'green'] })).to.equal(true);

        done();
      }, 1)
      .catch((err) => { 
        done(err);
      });
    });
  });
});


describe('wizard with forked execution', function() {
  it('should complete successfully', function(done) {
    const onComplete = sinon.spy(logComplete);
    const wrapper = mount(WizardExample3({ onComplete }));
    
    expect(wrapper.state('errors').fork).to.not.exist;

    wrapper.find('.next').simulate('click');
    expect(wrapper.state('errors').fork).to.equal('You must select one');
    wrapper.find('#finish').simulate('change', { target: { value: 'finish' }});
    expect(wrapper.state('values').fork).to.equal('finish');

    wrapper.find('.next').simulate('click');

    delay(() => {
      expect(wrapper.state('cleared')).contains('fork');
      expect(wrapper.state('active')).to.equal('confirm');

      wrapper.find('#fork').simulate('click');
    }, 1)
    .delay(() => {
      expect(wrapper.state('cleared')).to.deep.equal([]);
      expect(wrapper.state('active')).to.equal('fork');

      wrapper.find('.next').simulate('click');
    })
    .delay(() => {
      expect(wrapper.state('cleared')).contains('fork');
      expect(wrapper.state('active')).to.equal('confirm');

      wrapper.find('.complete').simulate('click');
      expect(wrapper.state('completed')).to.equal(true);
      expect(wrapper.state('values')).to.deep.equal({fork: 'finish', colors: [], confirm: '' });

      expect(onComplete).to.be.calledOnce;
      expect(onComplete.calledWith({ fork: 'finish' })).to.equal(true);

      done();
    }, 1)
    .catch((err) => { 
      done(err);
    });
  });
});

describe('wizard using promiseOnNext', function() {
  it('should complete successfully', function(done) {
    const onComplete = sinon.spy(logComplete);
    const wrapper = mount(WizardExample4({ onComplete }));

    expect(wrapper.state('errors').singlestep).to.not.exist;
    wrapper.find('.complete').simulate('click');
    expect(wrapper.state('errors').singlestep).to.equal('Say sth');
    wrapper.find('input').simulate('change', { target: { value: 'sth' }});
    expect(wrapper.state('values').singlestep).to.equal('sth');
    wrapper.find('.complete').simulate('click');
    
    delay(() => {
      expect(wrapper.state('cleared')).contains('singlestep');
      expect(wrapper.state('completed')).to.equal(true);
      expect(wrapper.state('values')).to.deep.equal({ singlestep: 'sth' });

      expect(onComplete).to.be.calledOnce;
      expect(onComplete.calledWith({ singlestep: 'sth' })).to.equal(true);

      done();
    }, 1)
    .catch((err) => { 
      done(err);
    });
  });
});
