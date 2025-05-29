import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ScrollView,
    Modal,
    Alert,
    ActivityIndicator
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../scripts/firebase';
import { ref, get } from 'firebase/database';

// Define types
type OrderItem = {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    totalPrice: number;
    image: string;
    category?: string;
};

type Order = {
    id: string;
    orderNumber: string;
    items: OrderItem[];
    totalAmount: number;
    status: string;
    createdAt: number;
    userEmail?: string;
    customerName?: string;
};

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
    orderNumber: string;
    userEmail: string;
};

type ProductSales = {
    [key: string]: {
        name: string;
        quantity: number;
        category: string;
    }
};

type UserSummary = {
    email: string;
    totalOrders: number;
    totalSpent: number;
    completedOrders: number;
    pendingOrders: number;
};

const Sales = () => {
    const router = useRouter();
    const pathname = usePathname();

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [filterPeriod, setFilterPeriod] = useState('All');

    // Sales metrics
    const [totalSales, setTotalSales] = useState(0);
    const [completedOrders, setCompletedOrders] = useState(0);
    const [pendingOrders, setPendingOrders] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);
    const [bestSellingProduct, setBestSellingProduct] = useState({
        name: '',
        quantity: 0,
        category: ''
    });
    const [topCustomers, setTopCustomers] = useState<UserSummary[]>([]);

    useEffect(() => {
        fetchAllOrders();
    }, []);

    const fetchAllOrders = async () => {
        try {
            setLoading(true);
            const ordersRef = ref(db, 'orders');
            const snapshot = await get(ordersRef);

            if (snapshot.exists()) {
                const allOrdersData = snapshot.val();

                // Process orders from all users
                const transactionsArray: Transaction[] = [];
                const productSales: ProductSales = {};
                const userSummaries: { [email: string]: UserSummary } = {};

                let totalSalesAmount = 0;
                let completed = 0;
                let pending = 0;

                // Iterate through each user's orders
                Object.keys(allOrdersData).forEach(userKey => {
                    const userOrders = allOrdersData[userKey];
                    const userEmail = userKey.replace(/_/g, '.'); // Convert back from sanitized format

                    // Initialize user summary
                    if (!userSummaries[userEmail]) {
                        userSummaries[userEmail] = {
                            email: userEmail,
                            totalOrders: 0,
                            totalSpent: 0,
                            completedOrders: 0,
                            pendingOrders: 0,
                        };
                    }

                    // Process each order for this user
                    Object.keys(userOrders).forEach(orderKey => {
                        const order = userOrders[orderKey];

                        // Update user summary
                        userSummaries[userEmail].totalOrders++;

                        // Count order statuses
                        if (order.status.toLowerCase() === 'completed') {
                            completed++;
                            totalSalesAmount += order.totalAmount;
                            userSummaries[userEmail].completedOrders++;
                            userSummaries[userEmail].totalSpent += order.totalAmount;
                        } else if (order.status.toLowerCase() === 'pending') {
                            pending++;
                            userSummaries[userEmail].pendingOrders++;
                        }

                        // Process each item in the order
                        order.items.forEach((item: OrderItem) => {
                            // Get category with fallback
                            const category = item.category || 'Fish';

                            // Track product sales for best selling calculation
                            if (!productSales[item.productId]) {
                                productSales[item.productId] = {
                                    name: item.name,
                                    quantity: 0,
                                    category: category
                                };
                            }

                            if (order.status.toLowerCase() === 'completed') {
                                productSales[item.productId].quantity += item.quantity;
                            }

                            // Create transaction record
                            transactionsArray.push({
                                id: `${orderKey}-${item.productId}`,
                                productName: item.name,
                                category: category,
                                quantity: item.quantity,
                                unitPrice: item.price,
                                totalPrice: item.totalPrice,
                                date: new Date(order.createdAt).toLocaleDateString(),
                                time: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                customerName: userEmail.split('@')[0], // Use email prefix as customer name
                                status: order.status,
                                orderNumber: order.orderNumber,
                                userEmail: userEmail
                            });
                        });
                    });
                });

                // Find best selling product
                let bestProduct = { id: '', name: '', quantity: 0, category: '' };
                Object.keys(productSales).forEach(productId => {
                    if (productSales[productId].quantity > bestProduct.quantity) {
                        bestProduct = {
                            id: productId,
                            name: productSales[productId].name,
                            quantity: productSales[productId].quantity,
                            category: productSales[productId].category
                        };
                    }
                });

                // Sort transactions by date (newest first)
                transactionsArray.sort((a, b) => {
                    const dateA = new Date(`${a.date} ${a.time}`).getTime();
                    const dateB = new Date(`${b.date} ${b.time}`).getTime();
                    return dateB - dateA;
                });

                // Get top customers (by total spent)
                const topCustomersList = Object.values(userSummaries)
                    .sort((a, b) => b.totalSpent - a.totalSpent)
                    .slice(0, 5);

                // Update state
                setTransactions(transactionsArray);
                setTotalSales(totalSalesAmount);
                setCompletedOrders(completed);
                setPendingOrders(pending);
                setTotalUsers(Object.keys(userSummaries).length);
                setBestSellingProduct({
                    name: bestProduct.name,
                    quantity: bestProduct.quantity,
                    category: bestProduct.category
                });
                setTopCustomers(topCustomersList);

            } else {
                console.log('No orders found in database');
                setTransactions([]);
                setTotalSales(0);
                setCompletedOrders(0);
                setPendingOrders(0);
                setTotalUsers(0);
                setBestSellingProduct({ name: '', quantity: 0, category: '' });
                setTopCustomers([]);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            Alert.alert('Error', 'Failed to load sales data');
        } finally {
            setLoading(false);
        }
    };

    interface IsActiveRouteFn {
        (route: string): boolean;
    }

    const isActiveRoute: IsActiveRouteFn = (route) => {
        return pathname.includes(route);
    };

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
        switch (status.toLowerCase()) {
            case 'completed': return '#4CAF50';
            case 'pending': return '#FF9800';
            case 'processing': return '#2196F3';
            case 'shipped': return '#FF5722';
            case 'cancelled': return '#F44336';
            default: return '#757575';
        }
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
            <Text style={styles.transactionDetail}>Order: {item.orderNumber}</Text>
            <Text style={styles.transactionDetail}>Customer: {item.customerName}</Text>
            <Text style={styles.transactionDetail}>Email: {item.userEmail}</Text>
            <Text style={styles.transactionDetail}>Quantity: {item.quantity}</Text>
            <View style={styles.transactionFooter}>
                <Text style={styles.transactionDate}>{item.date} {item.time}</Text>
                <Text style={styles.transactionPrice}>₱{item.totalPrice.toFixed(2)}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderTopCustomer = ({ item, index }: { item: UserSummary; index: number }) => (
        <View style={styles.customerCard}>
            <View style={styles.customerRank}>
                <Text style={styles.rankNumber}>#{index + 1}</Text>
            </View>
            <View style={styles.customerInfo}>
                <Text style={styles.customerEmail}>{item.email}</Text>
                <Text style={styles.customerStats}>
                    {item.completedOrders} orders • ₱{item.totalSpent.toFixed(2)}
                </Text>
            </View>
        </View>
    );

    const refreshData = () => {
        fetchAllOrders();
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#3F51B5" />
                <Text style={styles.loadingText}>Loading sales data...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>Sales Report</Text>
                    <TouchableOpacity style={styles.refreshButton} onPress={refreshData}>
                        <Ionicons name="refresh" size={22} color="#3F51B5" />
                    </TouchableOpacity>
                </View>

                {/* Summary Cards */}
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryCard}>
                        <Ionicons name="cash" size={24} color="#4CAF50" />
                        <Text style={styles.summaryValue}>₱{totalSales.toFixed(2)}</Text>
                        <Text style={styles.summaryLabel}>Total Sales</Text>
                    </View>

                    <View style={styles.summaryCard}>
                        <Ionicons name="receipt" size={24} color="#2196F3" />
                        <Text style={styles.summaryValue}>{completedOrders}</Text>
                        <Text style={styles.summaryLabel}>Completed</Text>
                    </View>

                    <View style={styles.summaryCard}>
                        <Ionicons name="time" size={24} color="#FF9800" />
                        <Text style={styles.summaryValue}>{pendingOrders}</Text>
                        <Text style={styles.summaryLabel}>Pending</Text>
                    </View>

                    <View style={styles.summaryCard}>
                        <Ionicons name="people" size={24} color="#9C27B0" />
                        <Text style={styles.summaryValue}>{totalUsers}</Text>
                        <Text style={styles.summaryLabel}>Customers</Text>
                    </View>
                </View>

                {/* Top Product */}
                <View style={styles.topProductCard}>
                    <Text style={styles.topProductTitle}>Best Selling Product</Text>
                    {bestSellingProduct.name ? (
                        <>
                            <Text style={styles.topProductName}>{bestSellingProduct.name}</Text>
                            <Text style={styles.topProductCategory}>{bestSellingProduct.category}</Text>
                            <Text style={styles.topProductSold}>
                                {bestSellingProduct.quantity} units sold
                            </Text>
                        </>
                    ) : (
                        <Text style={styles.noDataText}>No sales data available</Text>
                    )}
                </View>

                {/* Top Customers */}
                {topCustomers.length > 0 && (
                    <View style={styles.topCustomersCard}>
                        <Text style={styles.topCustomersTitle}>Top Customers</Text>
                        <FlatList
                            data={topCustomers}
                            renderItem={renderTopCustomer}
                            keyExtractor={(item) => item.email}
                            scrollEnabled={false}
                        />
                    </View>
                )}

                {/* Filter Options */}
                <View style={styles.filterContainer}>
                    <Text style={styles.filterTitle}>Recent Transactions</Text>
                    <TouchableOpacity style={styles.filterButton}>
                        <Text style={styles.filterButtonText}>All Time</Text>
                        <Ionicons name="chevron-down" size={16} color="#666" />
                    </TouchableOpacity>
                </View>

                {/* Transactions List */}
                {transactions.length > 0 ? (
                    <FlatList
                        data={transactions}
                        renderItem={renderTransaction}
                        keyExtractor={item => item.id}
                        style={styles.transactionsList}
                        scrollEnabled={false}
                    />
                ) : (
                    <View style={styles.noTransactionsContainer}>
                        <Ionicons name="receipt-outline" size={48} color="#ccc" />
                        <Text style={styles.noTransactionsText}>No transactions found</Text>
                    </View>
                )}
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
                                    <Text style={styles.detailLabel}>Order Number:</Text>
                                    <Text style={styles.detailValue}>{selectedTransaction.orderNumber}</Text>
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
                                    <Text style={styles.detailLabel}>Email:</Text>
                                    <Text style={styles.detailValue}>{selectedTransaction.userEmail}</Text>
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
                    onPress={() => {
                        Alert.alert(
                            'Confirm Logout',
                            'Are you sure you want to logout?',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Logout',
                                    style: 'destructive',
                                    onPress: () => router.replace('/login'),
                                },
                            ],
                            { cancelable: true }
                        );
                    }}
                >
                    <Ionicons
                        name="log-out-outline"
                        size={24}
                        color="#F44336"
                    />
                    <Text style={[styles.navLabel, { color: '#F44336' }]}>Logout</Text>
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
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    content: {
        flex: 1,
        padding: 16,
        paddingBottom: 80,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    refreshButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(63, 81, 181, 0.1)',
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        flexWrap: 'wrap',
    },
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 2,
        marginVertical: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        minWidth: '22%',
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 4,
        color: '#333',
    },
    summaryLabel: {
        fontSize: 10,
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
    topProductCategory: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    topProductSold: {
        fontSize: 14,
        color: '#4CAF50',
    },
    topCustomersCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    topCustomersTitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 12,
    },
    customerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    customerRank: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#3F51B5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    rankNumber: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    customerInfo: {
        flex: 1,
    },
    customerEmail: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    customerStats: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    noDataText: {
        fontSize: 16,
        color: '#999',
        fontStyle: 'italic',
        marginTop: 8,
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
    noTransactionsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 20,
    },
    noTransactionsText: {
        marginTop: 10,
        fontSize: 16,
        color: '#999',
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