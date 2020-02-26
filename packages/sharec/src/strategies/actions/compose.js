const flow = require('lodash/flow')
const omit = require('lodash/omit')
const pick = require('lodash/pick')
const isEmpty = require('lodash/isEmpty')
const operators = require('../operators')

const operatorsKeys = Object.keys(operators)

// TODO: move to external module?
/**
 * @param {Array<Function>} schemas
 * @returns {Function}
 */
const applyToEachListElement = schema =>
  /**
   * @param {Object} params
   * @returns {Array}
   */
  ({ current, upcoming, cached }) => {
    let result = []

    for (const i in upcoming) {
      result.push(
        schema({
          current: current[i],
          upcoming: upcoming[i],
          cached: cached[i],
        }),
      )
    }

    return result
  }

/**
 * @param {Array<Function>} schemas
 * @returns {Function}
 */
const applyToIndexedListElements = schemas =>
  /**
   * @param {Object} params
   * @returns {Array}
   */
  ({ current, upcoming, cached }) => {
    let result = []

    for (const i in schemas) {
      result.push(
        schemas[i]({
          current: current[i],
          upcoming: upcoming[i],
          cached: cached[i],
        }),
      )
    }

    return result
  }

/**
 * @param {Array<Function>} schemas
 * @returns {Function}
 */
const applyToList = schemas =>
  /**
   * @param {Object} params
   * @returns {Array}
   */
  params => {
    if (schemas.length === 1) {
      return applyToEachListElement(schemas[0])(params)
    }

    return applyToIndexedListElements(schemas)(params)
  }

/**
 * @param {Object} schema
 * @returns {Function}
 */
const compose = schema =>
  /**
   * @param {Object} params
   * @returns {Object}
   */
  params => {
    const { current, upcoming, cached } = params

    if (!upcoming) return current
    if (!current) return upcoming
    if (typeof current !== typeof upcoming) return upcoming
    if (Array.isArray(schema)) {
      return applyToList(schema)(params)
    }

    let result = {}
    const schemaWithoutOperators = omit(schema, operatorsKeys)

    for (const key in schemaWithoutOperators) {
      if (!current[key] && !upcoming[key]) continue

      Object.assign(result, {
        [key]: schemaWithoutOperators[key]({
          current: current[key],
          upcoming: upcoming[key],
          cached: cached && cached[key],
        }),
      })
    }

    const isOperatorsExists = !flow(
      pick,
      isEmpty,
    )(schema, operatorsKeys)

    if (!isOperatorsExists) return result
    if (schema.$$default) {
      return operators.$$default({
        target: result,
        strategy: schema.$$default,
      })(params)
    }

    return result
  }

module.exports = compose
