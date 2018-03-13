# React Native Realm Connect

Connect React Native components to Realm queries

Rely on [Realm Notifications](https://realm.io/docs/javascript/latest/#notifications).

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
})(MyWrappedComponent)
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
    cat: PropTypes.instanceOf(Cat).isRequired,
  };

  render() {
    const { cat } = this.props;

    return <Text>{cat.name}</Text>;
  }
}

export default connectToQuery({
  cat: unique(() => realm.objects('Cat').filtered('user.id == $0', 'me')),
})(MyCat);
```
