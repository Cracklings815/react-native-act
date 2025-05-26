import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  ScrollView,
  Modal,
  Alert
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const Sales = () => {
    const router = useRouter();
    const pathname = usePathname();
    
    // Sample transaction data
    const [transactions, setTransactions] = useState([
        {
            id: '1',
            productName: 'Goldfish',
            category: 'Freshwater',
            quantity: 2,
            unitPrice: 50,
            totalPrice: 100,
            date: '2025-05-25',
            time: '10:30 AM',
            customerName: 'John Doe',
            status: 'Completed'
        },
        {
            id: '2',
            productName: 'Clownfish',
            category: 'Saltwater',
            quantity: 1,
            unitPrice: 80,
            totalPrice: 80,
            date: '2025-05-25',
            time: '02:15 PM',
            customerName: 'Jane Smith',
            status: 'Completed'
        },
        {
            id: '3',
            productName: 'Goldfish',
            category: 'Freshwater',
            quantity: 3,
            unitPrice: 50,
            totalPrice: 150,
            date: '2025-05-24',
            time: '11:45 AM',
            customerName: 'Mike Johnson',
            status: 'Completed'
        },
        {
            id: '4',
            productName: 'Betta Fish',
            category: 'Tropical',
            quantity: 1,
            unitPrice: 35,
            totalPrice: 35,
            date: '2025-05-24',
            time: '04:20 PM',
            customerName: 'Sarah Wilson',
            status: 'Pending'
        },
        {
            id: '5',
            productName: 'Clownfish',
            category: 'Saltwater',
            quantity: 2,
            unitPrice: 80,
            totalPrice: 160,
            date: '2025-05-23',
            time: '09:10 AM',
            customerName: 'David Brown',
            status: 'Completed'
        }
    ]);

    type Transaction = {
        id: string;
        productName: string;
        category: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        date: string;
        time: string;
        customerName: string;
        status: string;
    };
    
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [filterPeriod, setFilterPeriod] = useState('All');

    // Function to determine if a route is active
    interface IsActiveRouteFn {
        (route: string): boolean;
    }

    const isActiveRoute: IsActiveRouteFn = (route) => {
        return pathname.includes(route);
    };

    // Calculate summary statistics
    const totalSales = transactions
        .filter(t => t.status === 'Completed')
        .reduce((sum, t) => sum + t.totalPrice, 0);
    
    const totalTransactions = transactions.filter(t => t.status === 'Completed').length;
    const pendingTransactions = transactions.filter(t => t.status === 'Pending').length;

    const mostSoldProduct = transactions
        .filter(t => t.status === 'Completed')
        .reduce((acc: { [key: string]: number }, curr) => {
            acc[curr.productName] = (acc[curr.productName] || 0) + curr.quantity;
            return acc;
        }, {} as { [key: string]: number });
    
    const topProduct = Object.keys(mostSoldProduct).reduce((a, b) => 
        mostSoldProduct[a] > mostSoldProduct[b] ? a : b, ''
    );

    interface ShowTransactionDetailsFn {
        (transaction: Transaction): void;
    }

    const showTransactionDetails: ShowTransactionDetailsFn = (transaction) => {
        setSelectedTransaction(transaction);
        setModalVisible(true);
    };

    interface GetStatusColorFn {
        (status: string): string;
    }

    const getStatusColor: GetStatusColorFn = (status) => {
        return status === 'Completed' ? '#4CAF50' : '#FF9800';
    };

    const renderTransaction = ({ item }: { item: Transaction }) => (
        <TouchableOpacity 
            style={styles.transactionCard}
            onPress={() => showTransactionDetails(item)}
        >
            <View style={styles.transactionHeader}>
                <Text style={styles.productName}>{item.productName}</Text>
                <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
                    {item.status}
                </Text>
            </View>
            <Text style={styles.transactionDetail}>Customer: {item.customerName}</Text>
            <Text style={styles.transactionDetail}>Quantity: {item.quantity}</Text>
            <View style={styles.transactionFooter}>
                <Text style={styles.transactionDate}>{item.date} {item.time}</Text>
                <Text style={styles.transactionPrice}>₱{item.totalPrice.toFixed(2)}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Sales Report</Text>
                
                {/* Summary Cards */}
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryCard}>
                        <Ionicons name="cash" size={24} color="#4CAF50" />
                        <Text style={styles.summaryValue}>₱{totalSales.toFixed(2)}</Text>
                        <Text style={styles.summaryLabel}>Total Sales</Text>
                    </View>
                    
                    <View style={styles.summaryCard}>
                        <Ionicons name="receipt" size={24} color="#2196F3" />
                        <Text style={styles.summaryValue}>{totalTransactions}</Text>
                        <Text style={styles.summaryLabel}>Completed</Text>
                    </View>
                    
                    <View style={styles.summaryCard}>
                        <Ionicons name="time" size={24} color="#FF9800" />
                        <Text style={styles.summaryValue}>{pendingTransactions}</Text>
                        <Text style={styles.summaryLabel}>Pending</Text>
                    </View>
                </View>

                {/* Top Product */}
                <View style={styles.topProductCard}>
                    <Text style={styles.topProductTitle}>Best Selling Product</Text>
                    <Text style={styles.topProductName}>{topProduct}</Text>
                    <Text style={styles.topProductSold}>
                        {mostSoldProduct[topProduct]} units sold
                    </Text>
                </View>

                {/* Filter Options */}
                <View style={styles.filterContainer}>
                    <Text style={styles.filterTitle}>Recent Transactions</Text>
                    <TouchableOpacity style={styles.filterButton}>
                        <Text style={styles.filterButtonText}>All Time</Text>
                        <Ionicons name="chevron-down" size={16} color="#666" />
                    </TouchableOpacity>
                </View>

                {/* Transactions List */}
                <FlatList
                    data={transactions}
                    renderItem={renderTransaction}
                    keyExtractor={item => item.id}
                    style={styles.transactionsList}
                    scrollEnabled={false}
                />
            </ScrollView>

            {/* Transaction Details Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Transaction Details</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>
                        
                        {selectedTransaction && (
                            <View style={styles.modalContent}>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Transaction ID:</Text>
                                    <Text style={styles.detailValue}>#{selectedTransaction.id}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Product:</Text>
                                    <Text style={styles.detailValue}>{selectedTransaction.productName}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Category:</Text>
                                    <Text style={styles.detailValue}>{selectedTransaction.category}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Customer:</Text>
                                    <Text style={styles.detailValue}>{selectedTransaction.customerName}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Quantity:</Text>
                                    <Text style={styles.detailValue}>{selectedTransaction.quantity}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Unit Price:</Text>
                                    <Text style={styles.detailValue}>₱{selectedTransaction.unitPrice.toFixed(2)}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Total Price:</Text>
                                    <Text style={[styles.detailValue, styles.totalPrice]}>
                                        ₱{selectedTransaction.totalPrice.toFixed(2)}
                                    </Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Date & Time:</Text>
                                    <Text style={styles.detailValue}>
                                        {selectedTransaction.date} {selectedTransaction.time}
                                    </Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Status:</Text>
                                    <Text style={[
                                        styles.detailValue, 
                                        { color: getStatusColor(selectedTransaction.status) }
                                    ]}>
                                        {selectedTransaction.status}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity 
                    style={styles.navItem} 
                    onPress={() => router.push('/(admin)/AdminPanel')}
                >
                    <Ionicons 
                        name="home" 
                        size={24} 
                        color={isActiveRoute('AdminPanel') ? '#3F51B5' : '#757575'} 
                    />
                    <Text style={[
                        styles.navLabel, 
                        { color: isActiveRoute('AdminPanel') ? '#3F51B5' : '#757575' }
                    ]}>
                        Home
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.navItem} 
                    onPress={() => router.push('/(admin)/Sales')}
                >
                    <Ionicons 
                        name="analytics" 
                        size={24} 
                        color={isActiveRoute('Sales') ? '#3F51B5' : '#757575'} 
                    />
                    <Text style={[
                        styles.navLabel, 
                        { color: isActiveRoute('Sales') ? '#3F51B5' : '#757575' }
                    ]}>
                        Reports
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.navItem} 
                    onPress={() => router.push('/settings')}
                >
                    <Ionicons 
                        name="settings" 
                        size={24} 
                        color={isActiveRoute('settings') ? '#3F51B5' : '#757575'} 
                    />
                    <Text style={[
                        styles.navLabel, 
                        { color: isActiveRoute('settings') ? '#3F51B5' : '#757575' }
                    ]}>
                        Settings
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        padding: 16,
        paddingBottom: 80,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 40,
        marginBottom: 20,
        color: '#333',
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 4,
        color: '#333',
    },
    summaryLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    topProductCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    topProductTitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    topProductName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3F51B5',
        marginBottom: 4,
    },
    topProductSold: {
        fontSize: 14,
        color: '#4CAF50',
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    filterTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    filterButtonText: {
        marginRight: 4,
        color: '#666',
    },
    transactionsList: {
        marginBottom: 20,
    },
    transactionCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    transactionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    status: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    transactionDetail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    transactionFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    transactionDate: {
        fontSize: 12,
        color: '#999',
    },
    transactionPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3F51B5',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        width: '90%',
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    modalContent: {
        padding: 20,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingVertical: 4,
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        flex: 1,
        textAlign: 'right',
    },
    totalPrice: {
        fontSize: 16,
        color: '#3F51B5',
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
        zIndex: 10,
    },
    navItem: {
        alignItems: 'center',
    },
    navLabel: {
        fontSize: 12,
        marginTop: 2,
    },
});

export default Sales;