// // app/coin_transfer.tsx
// import 'react-native-get-random-values'; // FIX crypto error - MUST BE FIRST
// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
//   RefreshControl,
//   Modal,
//   FlatList,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Ionicons } from '@expo/vector-icons';
// import { router } from 'expo-router';
// import { useAuth } from '@/hooks/useAuth';
// import web3Service from '@/services/web3Service';
// import { userService, User } from '@/services/userService';

// interface Transaction {
//   txHash: string;
//   timestamp: Date;
//   from: string;
//   to: string;
//   amount: string;
//   type: 'sent' | 'received';
// }

// export default function CoinTransferScreen() {
//   const { user } = useAuth();
//   const [balance, setBalance] = useState<string>('0');
//   const [selectedUser, setSelectedUser] = useState<User | null>(null);
//   const [amount, setAmount] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [transactions, setTransactions] = useState<Transaction[]>([]);
  
//   // User search modal
//   const [showUserModal, setShowUserModal] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [usersList, setUsersList] = useState<User[]>([]);
//   const [isSearching, setIsSearching] = useState(false);

//   useEffect(() => {
//     loadBalance();
//     loadTransactions();
//     searchUsers(''); // Load initial users
//   }, []);

//   const loadBalance = async () => {
//     if (!user?.id) return;
    
//     try {
//       const userBalance = await web3Service.getUserBalance(user.id);
//       if (userBalance) {
//         setBalance(userBalance.balance);
//       }
//     } catch (error) {
//       console.error('Load balance error:', error);
//       Alert.alert('Lỗi', 'Không thể tải số dư. Vui lòng kiểm tra kết nối blockchain.');
//     }
//   };

//   const loadTransactions = async () => {
//     if (!user?.id) return;
    
//     try {
//       const history = await web3Service.getTransactionHistory(user.id, 10);
//       setTransactions(history);
//     } catch (error) {
//       console.error('Load transactions error:', error);
//       // Don't show alert for transaction history errors
//     }
//   };

//   const searchUsers = async (query: string) => {
//     setIsSearching(true);
//     try {
//       const result = await userService.searchUsers(query, user?.id);
//       if (result.success && result.users) {
//         setUsersList(result.users);
//       }
//     } catch (error) {
//       console.error('Search users error:', error);
//     } finally {
//       setIsSearching(false);
//     }
//   };

//   const handleSearchChange = (text: string) => {
//     setSearchQuery(text);
//     // Debounce search
//     const timeoutId = setTimeout(() => {
//       searchUsers(text);
//     }, 300);
//     return () => clearTimeout(timeoutId);
//   };

//   const handleSelectUser = (selectedUser: User) => {
//     setSelectedUser(selectedUser);
//     setShowUserModal(false);
//     setSearchQuery('');
//   };

//   const handleRefresh = async () => {
//     setIsRefreshing(true);
//     await Promise.all([loadBalance(), loadTransactions()]);
//     setIsRefreshing(false);
//   };

//   const handleTransfer = async () => {
//     if (!user?.id) {
//       Alert.alert('Lỗi', 'Vui lòng đăng nhập');
//       return;
//     }

//     if (!selectedUser) {
//       Alert.alert('Lỗi', 'Vui lòng chọn người nhận');
//       return;
//     }

//     if (!amount) {
//       Alert.alert('Lỗi', 'Vui lòng nhập số lượng coin');
//       return;
//     }

//     const transferAmount = parseFloat(amount);
//     if (isNaN(transferAmount) || transferAmount <= 0) {
//       Alert.alert('Lỗi', 'Số lượng không hợp lệ');
//       return;
//     }

//     if (transferAmount > parseFloat(balance)) {
//       Alert.alert('Lỗi', 'Số dư không đủ');
//       return;
//     }

//     Alert.alert(
//       'Xác nhận chuyển coin',
//       `Bạn muốn chuyển ${amount} COIN cho ${selectedUser.fullName}?`,
//       [
//         { text: 'Hủy', style: 'cancel' },
//         {
//           text: 'Chuyển',
//           onPress: performTransfer,
//         },
//       ]
//     );
//   };

//   const performTransfer = async () => {
//     setIsLoading(true);
    
//     try {
//       // In production, user's private key should be stored securely
//       // For demo, we'll use a test private key
//       const userPrivateKey = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';
      
//       const result = await web3Service.transferCoins(
//         user!.id,
//         selectedUser!.id,
//         parseFloat(amount),
//         userPrivateKey
//       );

//       if (result.success) {
//         Alert.alert(
//           'Thành công',
//           `Đã chuyển ${amount} COIN thành công!\nTransaction: ${result.txHash?.substring(0, 10)}...`,
//           [
//             {
//               text: 'OK',
//               onPress: () => {
//                 setSelectedUser(null);
//                 setAmount('');
//                 loadBalance();
//                 loadTransactions();
//               },
//             },
//           ]
//         );
//       } else {
//         Alert.alert('Lỗi', result.error || 'Không thể chuyển coin');
//       }
//     } catch (error: any) {
//       Alert.alert('Lỗi', error.message || 'Đã xảy ra lỗi');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const formatDate = (date: Date) => {
//     return new Date(date).toLocaleString('vi-VN', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//     });
//   };

//   return (
//     <SafeAreaView className="flex-1 bg-gray-50">
//       {/* Header */}
//       <View className="bg-white px-4 py-4 flex-row items-center border-b border-gray-100">
//         <TouchableOpacity onPress={() => router.back()} className="mr-3">
//           <Ionicons name="arrow-back" size={24} color="#1F2937" />
//         </TouchableOpacity>
//         <Text className="text-xl font-bold text-gray-900 flex-1">
//           Chuyển Coin
//         </Text>
//         <TouchableOpacity onPress={handleRefresh}>
//           <Ionicons name="refresh" size={24} color="#3B82F6" />
//         </TouchableOpacity>
//       </View>

//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
//         }
//       >
//         {/* Balance Card */}
//         <View className="mx-4 mt-4 bg-blue-500 rounded-2xl p-6">
//           <Text className="text-white/80 text-sm">Số dư hiện tại</Text>
//           <View className="flex-row items-end mt-2">
//             <Text className="text-white text-4xl font-bold">{balance}</Text>
//             <Text className="text-white/90 text-xl ml-2 mb-1">COIN</Text>
//           </View>
//           <View className="flex-row items-center mt-3">
//             <Ionicons name="wallet" size={16} color="#fff" />
//             <Text className="text-white/80 text-xs ml-2">
//               ≈ ₫ {(parseFloat(balance) * 1000).toLocaleString('vi-VN')}
//             </Text>
//           </View>
//         </View>

//         {/* Transfer Form */}
//         <View className="bg-white mx-4 mt-4 rounded-2xl p-4">
//           <Text className="text-gray-900 font-bold text-lg mb-4">
//             Chuyển Coin
//           </Text>

//           {/* Recipient - Click to search */}
//           <View className="mb-4">
//             <Text className="text-gray-700 font-medium mb-2">
//               Người nhận
//             </Text>
//             <TouchableOpacity
//               className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200"
//               onPress={() => setShowUserModal(true)}
//             >
//               <Ionicons name="person-outline" size={20} color="#6B7280" />
//               <Text className={`flex-1 ml-3 ${selectedUser ? 'text-gray-900' : 'text-gray-400'}`}>
//                 {selectedUser ? `${selectedUser.fullName} (ID: ${selectedUser.id})` : 'Chọn người nhận'}
//               </Text>
//               <Ionicons name="chevron-down" size={20} color="#6B7280" />
//             </TouchableOpacity>
            
//             {selectedUser && (
//               <View className="mt-2 bg-blue-50 rounded-lg p-3">
//                 <View className="flex-row items-center justify-between">
//                   <View className="flex-1">
//                     <Text className="text-gray-900 font-semibold">{selectedUser.fullName}</Text>
//                     <Text className="text-gray-600 text-sm">{selectedUser.email}</Text>
//                     {selectedUser.phone && (
//                       <Text className="text-gray-600 text-sm">{selectedUser.phone}</Text>
//                     )}
//                   </View>
//                   <TouchableOpacity onPress={() => setSelectedUser(null)}>
//                     <Ionicons name="close-circle" size={24} color="#EF4444" />
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             )}
//           </View>

//           {/* Amount */}
//           <View className="mb-4">
//             <Text className="text-gray-700 font-medium mb-2">Số lượng</Text>
//             <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
//               <Ionicons name="cash-outline" size={20} color="#6B7280" />
//               <TextInput
//                 className="flex-1 ml-3 text-gray-900"
//                 placeholder="Nhập số COIN"
//                 keyboardType="decimal-pad"
//                 value={amount}
//                 onChangeText={setAmount}
//               />
//               <Text className="text-gray-500 font-medium">COIN</Text>
//             </View>
//             <Text className="text-gray-500 text-xs mt-1 ml-1">
//               ≈ ₫ {(parseFloat(amount || '0') * 1000).toLocaleString('vi-VN')}
//             </Text>
//           </View>

//           {/* Quick Amount Buttons */}
//           <View className="flex-row justify-between mb-4">
//             {[10, 20, 50, 100].map((quickAmount) => (
//               <TouchableOpacity
//                 key={quickAmount}
//                 className="bg-blue-50 rounded-lg px-4 py-2 flex-1 mx-1"
//                 onPress={() => setAmount(quickAmount.toString())}
//               >
//                 <Text className="text-blue-600 font-semibold text-center text-sm">
//                   {quickAmount}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>

//           {/* Transfer Button */}
//           <TouchableOpacity
//             className={`rounded-xl py-4 flex-row items-center justify-center ${
//               isLoading ? 'bg-gray-300' : 'bg-blue-600'
//             }`}
//             onPress={handleTransfer}
//             disabled={isLoading}
//           >
//             {isLoading ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <>
//                 <Ionicons name="send" size={20} color="#fff" />
//                 <Text className="text-white font-bold text-base ml-2">
//                   Chuyển Coin
//                 </Text>
//               </>
//             )}
//           </TouchableOpacity>
//         </View>

//         {/* Transaction History */}
//         <View className="bg-white mx-4 mt-4 mb-6 rounded-2xl p-4">
//           <Text className="text-gray-900 font-bold text-lg mb-4">
//             Lịch sử giao dịch
//           </Text>

//           {transactions.length === 0 ? (
//             <View className="items-center py-8">
//               <Ionicons name="receipt-outline" size={48} color="#D1D5DB" />
//               <Text className="text-gray-400 mt-2">Chưa có giao dịch</Text>
//             </View>
//           ) : (
//             transactions.map((tx, index) => (
//               <View
//                 key={tx.txHash}
//                 className={`flex-row items-center py-3 ${
//                   index !== transactions.length - 1 ? 'border-b border-gray-100' : ''
//                 }`}
//               >
//                 <View
//                   className={`w-10 h-10 rounded-full items-center justify-center ${
//                     tx.type === 'received' ? 'bg-green-100' : 'bg-red-100'
//                   }`}
//                 >
//                   <Ionicons
//                     name={tx.type === 'received' ? 'arrow-down' : 'arrow-up'}
//                     size={20}
//                     color={tx.type === 'received' ? '#10B981' : '#EF4444'}
//                   />
//                 </View>

//                 <View className="flex-1 ml-3">
//                   <Text className="text-gray-900 font-semibold">
//                     {tx.type === 'received' ? 'Nhận coin' : 'Chuyển coin'}
//                   </Text>
//                   <Text className="text-gray-500 text-xs mt-0.5">
//                     {formatDate(tx.timestamp)}
//                   </Text>
//                   <Text className="text-gray-400 text-xs mt-0.5">
//                     {tx.txHash.substring(0, 20)}...
//                   </Text>
//                 </View>

//                 <Text
//                   className={`font-bold ${
//                     tx.type === 'received' ? 'text-green-600' : 'text-red-600'
//                   }`}
//                 >
//                   {tx.type === 'received' ? '+' : '-'}
//                   {tx.amount}
//                 </Text>
//               </View>
//             ))
//           )}
//         </View>
//       </ScrollView>

//       {/* User Search Modal */}
//       <Modal
//         visible={showUserModal}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setShowUserModal(false)}
//       >
//         <View className="flex-1 bg-black/50 justify-end">
//           <View className="bg-white rounded-t-3xl h-3/4">
//             {/* Modal Header */}
//             <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
//               <Text className="text-xl font-bold text-gray-900">
//                 Chọn người nhận
//               </Text>
//               <TouchableOpacity onPress={() => setShowUserModal(false)}>
//                 <Ionicons name="close" size={28} color="#6B7280" />
//               </TouchableOpacity>
//             </View>

//             {/* Search Input */}
//             <View className="px-4 py-3 border-b border-gray-200">
//               <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
//                 <Ionicons name="search" size={20} color="#6B7280" />
//                 <TextInput
//                   className="flex-1 ml-3 text-gray-900"
//                   placeholder="Tìm kiếm theo tên, email..."
//                   value={searchQuery}
//                   onChangeText={handleSearchChange}
//                   autoFocus
//                 />
//                 {isSearching && <ActivityIndicator size="small" />}
//               </View>
//             </View>

//             {/* Users List */}
//             <FlatList
//               data={usersList}
//               keyExtractor={(item) => item.id.toString()}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   className="px-4 py-4 border-b border-gray-100"
//                   onPress={() => handleSelectUser(item)}
//                 >
//                   <View className="flex-row items-center">
//                     <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
//                       <Text className="text-blue-600 font-bold text-lg">
//                         {item.fullName.charAt(0).toUpperCase()}
//                       </Text>
//                     </View>
//                     <View className="flex-1 ml-3">
//                       <Text className="text-gray-900 font-semibold">
//                         {item.fullName}
//                       </Text>
//                       <Text className="text-gray-600 text-sm">{item.email}</Text>
//                       {item.phone && (
//                         <Text className="text-gray-500 text-xs">{item.phone}</Text>
//                       )}
//                     </View>
//                     <View className="bg-gray-100 px-3 py-1 rounded-full">
//                       <Text className="text-gray-600 text-xs">ID: {item.id}</Text>
//                     </View>
//                   </View>
//                 </TouchableOpacity>
//               )}
//               ListEmptyComponent={
//                 <View className="items-center py-12">
//                   <Ionicons name="people-outline" size={64} color="#D1D5DB" />
//                   <Text className="text-gray-400 mt-4">
//                     {searchQuery ? 'Không tìm thấy người dùng' : 'Không có người dùng'}
//                   </Text>
//                 </View>
//               }
//             />
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }