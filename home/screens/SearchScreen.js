/* @flow */

import { Constants } from 'expo';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import gql from 'graphql-tag';
import { groupBy, debounce } from 'lodash';
import { graphql } from 'react-apollo';
import { EventEmitter } from 'fbemitter';

import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import isIPhoneX from '../utils/isIPhoneX';

const ResultsLimit = 10;
const SearchQuery = gql`
  query Home_Search($offset: Int!, $limit: Int!, $query: String!) {
    search(type: ALL, query: $query, offset: $offset, limit: $limit) {
      __typename
      ... on BaseSearchResult {
        id
        rank
      }
      ... on AppSearchResult {
        app {
          id
          fullName
          name
          description
          packageUsername
          iconUrl
          likeCount
          isLikedByMe
        }
      }
      ... on UserSearchResult {
        user {
          id
          fullName
          username
          appCount
          profilePhoto
          isLegacy
        }
      }
    }
  }
`;

@graphql(SearchQuery, {
  props: props => {
    let { data } = props;

    let results = groupBy(data.search, result => result.__typename);

    return {
      ...props,
      data: {
        ...data,
        results,
      },
    };
  },
  options: props => ({
    variables: {
      offset: 0,
      limit: props.limit || ResultsLimit,
      query: props.navigation.getParam('query', ''),
    },
    fetchPolicy: 'cache-and-network',
  }),
})
export default class SearchScreen extends React.Component {
  state = {
    text: '',
    emitter: new EventEmitter(),
  };

  _searchSubscription: any;

  componentDidMount() {
    this._searchSubscription = this.state.emitter.addListener(
      'change',
      debounce(this._handleChangeQuery, 16.6 * 2)
    );

    this.props.navigation.setParams({ emitter: this.state.emitter });
  }

  _handleChangeQuery = (text: string) => {
    this.props.navigation.setParams({
      query: text,
    });
  };

  componentWillUnmount() {
    this._searchSubscription && this._searchSubscription.remove();
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.searchBar}>
          <SearchBar emitter={this.state.emitter} />
        </View>
        <SearchResults query={this.props.data.variables.query} data={this.props.data} />
      </View>
    );
  }
}

const NOTCH_HEIGHT = isIPhoneX ? 20 : 0;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchBar: Platform.select({
    ios: {
      height: 70 + NOTCH_HEIGHT,
      paddingTop: 20 + NOTCH_HEIGHT,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: 'rgba(46, 59, 76, 0.10)',
    },
    web: {
      boxShadow: `0 2px 4px -1px rgba(0,0,0,0.2), 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12)`,
      height: 64,
      borderBottomColor: 'rgba(46, 59, 76, 0.1)',
      borderBottomWidth: StyleSheet.hairlineWidth,
      zIndex: 1,
    },
    default: {
      height: 56 + Constants.statusBarHeight,
      paddingTop: Constants.statusBarHeight,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: 'rgba(46, 59, 76, 0.10)',
    },
  }),
});
