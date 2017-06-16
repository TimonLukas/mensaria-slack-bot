const chai = require('chai');
const should = chai.should();

const util = require('./../util');

const wrap = (fn, ...params) => {
  return (() => {
    fn(...params);
  });
};

describe('util', () => {
  describe('#getHtml', () => {
    it('should get response content', done => {
      util.getHtml().then(data => {
        data.should.not.be.empty;
        done();
      }).catch(error => {
        throw error;
      });
    });
  });
});