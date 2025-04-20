import React from 'react';
import { FlatList, Text, View, StyleSheet, VirtualizedList } from 'react-native';
import { Redirect } from "expo-router";


interface Item {
  id: string;
  title: string;
}

const DATA: Item[] = [
    { id: '1', title: 'Item 1' },
    { id: '2', title: 'Item 2' },
    { id: '3', title: 'Item 3' },
    { id: '4', title: 'Item 4' },
    { id: '5', title: 'Item 5' },
];


const getItemCount = (data: Item[]): number => data.length;
const getItem = (data: Item[], index: number): Item => data[index];

const VL = () => {
    return (
        <VirtualizedList
        data={DATA}
        renderItem={({ item }) => {
            console.log(`Rendering item: ${item.title}`);
            return <Text style={styles.title}>{item.title}</Text>;
        }}
        keyExtractor={(item) => item.id}
        getItemCount={getItemCount}
        getItem={getItem}
        />
    );
};

const styles = StyleSheet.create({
    
    title: {
        fontSize: 30,
        color: '#000000',
        backgroundColor: 'pink',
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 16,
        }
});

export default VL;