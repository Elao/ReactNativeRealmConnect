# React Native Realm Connect

Connect React Native components to Realm queries:

- Map a [proptype](https://reactjs.org/docs/typechecking-with-proptypes.html) to a [Realm query](https://realm.io/docs/javascript/latest/#queries) quite like you would map Redux store state to props with Redux [`connect`](https://github.com/reactjs/react-redux/blob/master/docs/api.md#inject-dispatch-and-todos).
- Every time the Realm query [changes](https://realm.io/docs/javascript/latest/#notifications), your component will receive the updated props (and thus re-render).

## Installation

    npm install @elao/react-native-realm-connect

## Usage

Get the connector method:

`import connectToQuery from '@elao/react-native-realm-connect';`

The `connectToQuery` method is similar to the `connect` method from redux (but not exactly the same) and should be used as follow:


```javascript
connectToQuery({
    [prop name]: [function that returns a Realm Results object],
    [...other props]
})(MyWrappedComponent);
```

### List

Example:

```javascript
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FlatList } from 'react-native';
import connectToQuery from '@elao/react-native-realm-connect';
import Dog from './model/Dog';

class DogList extends Component {
  static propTypes = {
    dogs: PropTypes.arrayOf(PropTypes.instanceOf(Dog)).isRequired,
  };

  render() {
    const { dogs } = this.props;

    return <FlatList data={dogs} /*...*/ />;
  }
}

export default connectToQuery({
  dogs: () => realm.objects('Dog').filtered('goodBoy == $0', true),
})(DogList);
```

### Unique result

Get the `unique` filter:

`import connectToQuery, { unique } from '@elao/react-native-realm-connect';`

Mark the query function as `unique` so that it only returns the first result of the Realm Results object:

```javascript
connectToQuery({
    [prop name]: unique([function that returns a Realm Results object]),
    [...other props]
})(MyWrappedComponent)
```

Example:

```javascript
// ...
import connectToQuery, { unique } from '@elao/react-native-realm-connect';

class MyCat extends Component {
  static propTypes = {
    userId: PropTypes.string.isRequired,
    cat: PropTypes.instanceOf(Cat).isRequired,
  };

  render() {
    const { cat } = this.props;

    return <Text>{cat.name}</Text>;
  }
}

export default connectToQuery({
  cat: unique(props => realm.objects('Cat').filtered('user.id == $0', props.userId)),
})(MyCat);
```

### Extract result

Get the `extract` filter:

`import connectToQuery, { extract } from '@elao/react-native-realm-connect';`

You can use `extract` for any other need, just provide a callback that will be applied on the `results` object and its return value will be passed as props.

```javascript
connectToQuery({
    [prop name]: extract([function that returns a Realm Results object with (props)], [callback function with (results, props) parameters],
    [...other props]
})(MyWrappedComponent)
```

Example:

```javascript
// ...
import connectToQuery, { unique } from '@elao/react-native-realm-connect';

class MyCat extends Component {
  static propTypes = {
    userId: PropTypes.string.isRequired,
    age: PropTypes.number.isRequired,
  };

  render() {
    const { age } = this.props;

    return <Text>I'm {age} years old.</Text>;
  }
}

export default connectToQuery({
  age: extract(
    props => realm.objects('User').filtered('id == $0', props.userId),
    (results, props) => results ? results[0].age : null,
  ),
})(MyCat);
```

### Usage with Redux

You can use a prop that comes from Redux state and use it in your Realm Query by chainning the two connectors:

```javascript
//...
import { connect } from 'react-redux';
import connectToQuery from '@elao/react-native-realm-connect';

class FishBowl extends Component {
  static propTypes = {
    fishes: PropTypes.arrayOf(PropTypes.instanceOf(Fish)).isRequired,
  };

  render() {
    const { fishes } = this.props;

    return <FlatList data={fishes} /*...*/ />;
  }
}

const mapStateToProps = state => ({
    color: state.filter.fishColor,
});

const RealmConnectedFishBowl = connectToQuery({
  dogs: props => realm.objects('Fish').filtered('color == $0', props.color),
})(FishBowl)

export default connect(mapStateToProps)(RealmConnectedFishBowl);
```
