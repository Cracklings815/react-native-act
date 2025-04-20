import React from 'react';
import { Text, View, StyleSheet, ScrollView, FlatList} from 'react-native';

const DATA = [
    { id: '1', title: 'Item 1' },
    { id: '2', title: 'Item 2' },
    { id: '3', title: 'Item 3' },
    { id: '4', title: 'Item 4' },
    { id: '5', title: 'Item 5' },
    { id: '6', title: 'Item 6' },
    { id: '7', title: 'Item 7' },
    { id: '8', title: 'Item 8' },
    { id: '9', title: 'Item 9' },
    { id: '10', title: 'Item 10' },
    { id: '11', title: 'Item 11' },
    { id: '12', title: 'Item 12' },
    { id: '13', title: 'Item 13' },
    { id: '14', title: 'Item 14' },
    { id: '15', title: 'Item 15' },
];

const example = () => {
    return (

        <FlatList
            data={DATA}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
                console.log(`Rendering item: ${item.title}`);
                return (
                    <Text style={styles.title}>
                        {item.title}
                    </Text>
                );
            }}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            windowSize={5}
            removeClippedSubviews={true}
            updateCellsBatchingPeriod={50}
        />
    
        //  <ScrollView>
        //     {DATA.map((item) => {
        //         console.log(`Rendering item: ${item.title}`); 
        //         return (
        //             <Text key={item.id} style={styles.title}>
        //                 {item.title}
        //             </Text>
        //         );
        //     })}
        // </ScrollView>
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

export default example;
