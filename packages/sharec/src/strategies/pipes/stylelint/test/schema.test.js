const { fixtures } = require('testUtils')
const { stylelintJson } = require('../schema')

describe('pipes > stylelint > schema', () => {
  describe('JSON', () => {
    const stylelintBaseFxt = fixtures('atomic/stylelint/json/00-base', 'json')

    it('should merge configs', () => {
      expect(stylelintJson(stylelintBaseFxt)).toEqual(stylelintBaseFxt.result)
    })
  })
})
