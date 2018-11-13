import { Component, createElement } from 'react';

/**
 * Mark a query result as unique (returns only the first result)
 *
 * @param {RealmResult} result
 *
 * @return {RealmResult}
 */
export function unique(results) {
  results.unique = true;

  return results;
}

/**
 * Mark a query result as count (returns number of results)
 *
 * @param {RealmResult} result
 *
 * @return {RealmResult}
 */
export function count(results) {
  results.count = true;

  return results;
}

/**
 * Attach an extractor to the query (returns the result of the given callback)
 *
 * @param {RealmResult} result
 *
 * @return {RealmResult}
 */
export function extract(results, extractor) {
  results.extractor = extractor;

  return results;
}

/**
 * Connect a React Native component to Realm queries
 *
 * @param {Object} queries
 * @param {Function|null} shouldComponentUpdate
 *
 * @return {Function}
 */
export default function connectToQuery(queries, shouldComponentUpdate = null) {
  /**
   * Wrapper function
   *
   * @param {Component} WrappedComponent
   *
   * @return {Component}
   */
  return function wrap(WrappedComponent) {
    /**
     * Wrapper component
     */
    return class WrapperComponent extends Component {
      constructor(props) {
        super(props);

        this.results = {};
        this.listeners = {};
        this.state = {};

        // Set up results and listeners
        Object.keys(queries).forEach(key => {
          this.results[key] = null;
          this.listeners[key] = (results, changes) => this.onChange(key, results, changes);
        });

        this.onChange = this.onChange.bind(this);
      }

      /**
       * Execute queries, add listeners and load state on component mount
       */
      componentDidMount() {
        this.setState(this.getStateFromProps());
      }

      /**
       * Update queries when props changes
       *
       * @param {Object} nextProps
       */
      componentWillReceiveProps(nextProps) {
        this.setState(this.getStateFromProps(nextProps));
      }

      /**
       * Remove listeners on component unmount
       */
      componentWillUnmount() {
        this.removeListeners();
      }

      /**
       * Get state from props
       *
       * @param {Object} props
       *
       * @return {Object}
       */
      getStateFromProps(props = this.props) {
        const state = {};

        Object.entries(queries).forEach(([key, query]) => {
          if (this.updateQuery(key, query, props)) {
            state[key] = this.getResult(key, this.results[key]);
          }
        });

        return state;
      }

      /**
       * Update query
       *
       * @param {String} key
       * @param {Function} query
       * @param {Object} props
       *
       * @return {Boolean} Has the query changed?
       */
      updateQuery(key, query, props) {
        const queryResult = query(props);

        if (queryResult !== this.results[key]) {
          if (this.results[key] !== null) {
            this.results[key].removeListener(this.listeners[key])
          }

          if (typeof queryResult === 'undefined') {
            throw new Error(key);
          }

          queryResult.addListener(this.listeners[key]);

          this.results[key] = queryResult;

          return true;
        }

        return false;
      }

      /**
       * Remove Realm listeners
       *
       * @param {Object} prevResults
       */
      removeListeners(prevResults = this.results) {
        Object.entries(prevResults).map(([key, results]) => results.removeListener(this.listeners[key]));
      }

      /**
       * Should component update?
       *
       * @param {Object} nextProps
       *
       * @return {Boolean}
       */
      shouldComponentUpdate(nextProps) {
        if (typeof shouldComponentUpdate === 'function') {
          return shouldComponentUpdate(nextProps);
        }

        return true;
      }

      /**
       * Get result
       *
       * @param {String} key
       * @param {RealmResult} results
       *
       * @return {Array|Object|null}
       */
      getResult(key, results) {
        // Unique query
        if (queries[key].unique) {
          return results.length ? results[0] : null;
        }

        // Count query
        if (queries[key].count) {
          return results.length;
        }

        // Apply extractor on query
        if (queries[key].extractor) {
          return queries[key].extractor(results);
        }

        // List query
        return Array.from(results);
      }

      /**
       * Update state on Realm change
       *
       * @param {String} key
       * @param {RealmResult} results
       * @param {Object} changes
       */
      onChange(key, results, changes) {
        const { modifications, insertions, deletions } = changes;

        if (modifications.length || insertions.length || deletions.length) {
          this.setState({ [key]: this.getResult(key, results) });
        }
      }

      /**
       * Renderer
       *
       * @return {Component|null}
       */
      render() {
        const { props, state } = this;

        if (Object.keys(state).length === 0) {
          return null;
        }

        return createElement(WrappedComponent, { ...props, ...state });
      }
    }
  };
}
