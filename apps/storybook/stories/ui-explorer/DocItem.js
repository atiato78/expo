import AppText from './AppText';
import insertBetween from './insertBetween';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const Divider = () => <View style={styles.verticalDivider} />;

const createDescription = description => {
  const nodeList = React.Children.toArray(description);
  let content;
  if (nodeList.length === 1) {
    content = <Text>{nodeList}</Text>;
  } else {
    content = insertBetween(() => <Divider key={Math.random()} />, nodeList);
  }
  return <Text style={styles.text}>{content}</Text>;
};

const DocItem = ({ description, example = {}, name, typeInfo, label }) => (
  <View style={styles.example}>
    {name && (
      <AppText style={styles.title}>
        <PropText label={label} name={name} typeInfo={typeInfo} />
      </AppText>
    )}
    {description && <View style={styles.description}>{createDescription(description)}</View>}
    {(example.render || example.code) && (
      <View style={styles.renderBox}>
        <AppText style={styles.exampleText}>Example</AppText>
        {example.render && <View>{example.render()}</View>}
        {example.render && example.code && <View style={styles.verticalDivider} />}
        {example.code && <Text style={styles.code}>{example.code}</Text>}
      </View>
    )}
  </View>
);

/**
 * ### getContactByIdAsync
 *
 * ```js
 * getContactByIdAsync(contactId: string, fields: FieldType[]): Promise<Contact>
 * ```
 * Returns a contact matching the input id. Used for gathering precise data about a contact.
 * **Parameters**
 *
 * | Name      | Type          | Description                                                                                  |
 * | --------- | ------------- | -------------------------------------------------------------------------------------------- |
 * | contactId | `string`      | The ID of a system contact.                                                                  |
 * | fields    | `FieldType[]` | If available the fields defined will be returned. If `nil` then all fields will be returned. |
 *
 * **Returns**
 *
 * | Name    | Type      | Description                               |
 * | ------- | --------- | ----------------------------------------- |
 * | contact | `Contact` | Contact with an ID matching the input ID. |
 *
 * **Example**
 *
 * ```js
 * const contact = await Contacts.getContactByIdAsync('161A368D-D614-4A15-8DC6-665FDBCFAE55');
 * if (contact) {
 *   console.log(contact);
 * }
 * ```
 */

import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';

const ParametersTable = ({ data, header }) => {
  return (
    <Table borderStyle={{ borderWidth: 2, borderColor: '#c8e1ff' }}>
      <Row
        data={header || ['Name', 'Type', 'Description']}
        style={{ height: 40, backgroundColor: '#f1f8ff' }}
        textStyle={{ margin: 6 }}
      />
      <Rows
        data={data.map(({ name, type, description }) => {
          let outputType = type;
          if (Array.isArray(type)) {
            outputType = type.join(' | ');
          }
          return [name, outputType, description];
        })}
        textStyle={{ margin: 6 }}
      />
    </Table>
  );
};

const ReturnsTable = ({ data, header }) => {
  return (
    <Table borderStyle={{ borderWidth: 2, borderColor: '#c8e1ff' }}>
      <Row
        data={header || ['Type', 'Description']}
        style={{ height: 40, backgroundColor: '#f1f8ff' }}
        textStyle={{ margin: 6 }}
      />
      <Rows
        data={data.map(({ type, description }) => {
          let outputType = type;
          if (Array.isArray(type)) {
            outputType = type.join(' | ');
          }
          return [outputType, description];
        })}
        textStyle={{ margin: 6 }}
      />
    </Table>
  );
};

const Parameters = ({ title, data, header }) => {
  return (
    <View>
      <AppText style={styles.title}>Parameters</AppText>
      <ParametersTable data={data} />
    </View>
  );
};
const Returns = ({ title, data, header }) => {
  return (
    <View>
      <AppText style={styles.title}>Returns</AppText>
      <ReturnsTable data={data} />
    </View>
  );
};

export const DocFunctionItem = ({
  description,
  parameters,
  returns,
  example = {},
  name,
  typeInfo,
  label,
}) => (
  <View style={styles.example}>
    {name && (
      <AppText style={styles.title}>
        <PropText label={label} name={name} typeInfo={typeInfo} />
      </AppText>
    )}
    {description && <View style={styles.description}>{createDescription(description)}</View>}
    {parameters && <Parameters data={parameters} />}
    {returns && <Returns data={returns} />}
    {(example.render || example.code) && (
      <View style={styles.renderBox}>
        <AppText style={styles.exampleText}>Example</AppText>
        {example.render && <View>{example.render()}</View>}
        {example.render && example.code && <View style={styles.verticalDivider} />}
        {example.code && <Text style={styles.code}>{example.code}</Text>}
      </View>
    )}
  </View>
);

const PropText = ({ label, name, typeInfo }) => (
  <AppText>
    {label && <Text style={[styles.label, label === 'web' && styles.webLabel]}>{label}</Text>}
    <Text style={styles.propName}>{name}</Text>
    {typeInfo && (
      <Text>
        {': '}
        <Text style={styles.code}>{typeInfo}</Text>
      </Text>
    )}
  </AppText>
);

const styles = StyleSheet.create({
  code: {
    fontFamily: 'monospace, monospace',
    fontSize: '1rem',
    lineHeight: '1.3125em',
  },
  example: {
    marginBottom: 'calc(1.5 * 1.3125rem)',
  },
  title: {
    fontSize: '1rem',
  },
  text: {
    alignItems: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    fontSize: '1rem',
    lineHeight: '1.3125em',
  },
  label: {
    backgroundColor: '#ddd',
    borderRadius: '1rem',
    color: '#555',
    marginRight: '0.5rem',
    paddingVertical: '0.125rem',
    paddingHorizontal: '0.5rem',
  },
  propName: {
    fontWeight: 'bold',
  },
  webLabel: {
    backgroundColor: '#bdebff',
    color: '#025268',
  },
  description: {
    marginTop: 'calc(0.5 * 1.3125rem)',
  },
  renderBox: {
    borderColor: '#E6ECF0',
    borderWidth: 1,
    padding: '1.3125rem',
    marginTop: '1.3125rem',
  },
  exampleText: {
    color: '#AAB8C2',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    marginBottom: 'calc(0.5 * 1.3125rem)',
    textTransform: 'uppercase',
  },
  verticalDivider: {
    height: '1rem',
  },
});

export default DocItem;
