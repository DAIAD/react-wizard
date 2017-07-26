import chai from 'chai';
import { expect } from 'chai';
import 'babel-polyfill';

import { filterObjByKeys } from '../src/utils';

describe('filterObjByKeys', function() {
  const values = { a: 1, b: 2, c: 3 };
  const filterKeys = ['a', 'c'];
  const res = filterObjByKeys(values, filterKeys);

  it('should return a different object', function() {
    expect(res).to.not.equal(values);
  });

  it('should only include filterKeys', function() {
    expect(res).to.deep.equal({ a: 1, c: 3 });
  }); 
});

