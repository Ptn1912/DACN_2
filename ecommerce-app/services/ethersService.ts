// services/ethersService.ts
import 'react-native-get-random-values';
import { Wallet, JsonRpcProvider, Contract, formatEther, parseEther, ZeroAddress } from 'ethers';
import contractConfig from '../contract-config.json';
import walletService from './walletService';

interface TransferResult {
  success: boolean;
  txHash?: string;
  error?: string;
  gasUsed?: string;
  fromBalance?: string;
  toBalance?: string;
}

interface UserBalance {
  userId: number;
  address: string;
  balance: string;
  balanceInEth: string;
}

// Interface contract
interface CoinContract extends Contract {
  userWallets(userId: number): Promise<string>;
  getUserBalance(userId: number): Promise<bigint>;
  registerUserWallet(userId: number, walletAddress: string): Promise<any>;
  mintCoins(to: string, amount: bigint): Promise<any>;
  transferByUserId?(toUserId: number, amount: bigint): Promise<any>;
  transfer?(to: string, amount: bigint): Promise<any>;
  balanceOf(address: string): Promise<bigint>;
}

class EthersService {
  private provider: JsonRpcProvider | null = null;
  private contract: CoinContract | null = null;
  private contractAddress: string;
  private ownerWallet: Wallet | null = null;
  private isInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    this.contractAddress = contractConfig.address;
  }

  private async waitForCrypto(maxAttempts = 10): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      if (typeof global.crypto?.getRandomValues === 'function') {
        try {
          const test = new Uint8Array(1);
          global.crypto.getRandomValues(test);
          console.log('✅ Crypto is ready');
          return;
        } catch {}
      }
      await new Promise(res => setTimeout(res, 100));
    }
    throw new Error('Crypto not available');
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initializationPromise) return this.initializationPromise;

    this.initializationPromise = this._doInitialize();
    return this.initializationPromise;
  }

  private async _doInitialize(): Promise<void> {
    await this.waitForCrypto();
    console.log('🔧 Initializing Ethers...');

    this.provider = new JsonRpcProvider('http://10.0.2.2:7545'); // hoặc port Ganache bạn dùng


    this.ownerWallet = new Wallet(
      '0xa9ca041c470d1708f73e9d24e01b2fc5ce34d0f18f7e727ba1ff0aaffbf7a51b',
      this.provider
    );

    this.contract = new Contract(this.contractAddress, contractConfig.abi, this.ownerWallet) as CoinContract;
    try {
    const contractOwner = await this.contract.owner();
    const ownerAddress = await this.ownerWallet.getAddress();
    console.log('👑 Contract owner:', contractOwner);
    console.log('👤 Current owner wallet:', ownerAddress);
    if (contractOwner.toLowerCase() !== ownerAddress.toLowerCase()) {
      console.error('❌ Owner wallet does not match contract owner!');
      // Có thể cần đổi private key để khớp với contract owner
    } else {
      console.log('✅ Owner wallet matches contract owner');
    }
  } catch (error) {
    console.error('❌ Error checking contract owner:', error);
  }

    this.isInitialized = true;
    console.log('✅ EthersService initialized');
  }

//   async debugTransferConditions(fromUserId: number, toUserId: number, amount: number): Promise<void> {
//   try {
//     await this.initialize();
//     if (!this.contract) throw new Error('Not initialized');

//     console.log('🐛 === DEBUG TRANSFER CONDITIONS ===');
    
//     const fromAddress = await this.contract.userWallets(fromUserId);
//     const toAddress = await this.contract.userWallets(toUserId);
    
//     console.log('👤 From user ID:', fromUserId, 'Address:', fromAddress);
//     console.log('👤 To user ID:', toUserId, 'Address:', toAddress);
    
//     const fromBalance = await this.contract.getUserBalance(fromUserId);
//     console.log('💰 From user balance (COIN):', fromBalance.toString());
    
//     const fromBalanceWei = await this.contract.balanceOf(fromAddress);
//     console.log('💰 From user balance (wei):', fromBalanceWei.toString());
    
//     const toBalance = await this.contract.getUserBalance(toUserId);
//     console.log('💰 To user balance (COIN):', toBalance.toString());
    
//     const toBalanceWei = await this.contract.balanceOf(toAddress);
//     console.log('💰 To user balance (wei):', toBalanceWei.toString());
    
//     console.log('🔀 Transfer amount:', amount, 'COIN');
    
//     // Kiểm tra điều kiện
//     const sufficientBalance = fromBalance >= BigInt(amount);
//     console.log('✅ Sufficient balance:', sufficientBalance);
    
//     console.log('🐛 === END DEBUG ===');
//   } catch (error) {
//     console.error('❌ Debug transfer conditions error:', error);
//   }
// }

  async getContractOwner(): Promise<string> {
  try {
    await this.initialize();
    if (!this.contract) throw new Error('Not initialized');
    return await this.contract.owner();
  } catch (error) {
    console.error('❌ Get contract owner error:', error);
    throw error;
  }
}
  async getUserBalance(userId: number): Promise<UserBalance | null> {
    try {
      await this.initialize();
      if (!this.provider || !this.contract) throw new Error('Not initialized');

      const walletAddress = await this.contract.userWallets(userId);
      console.log('📦 Wallet address for user', userId, ':', walletAddress);

      if (walletAddress === ZeroAddress) return null;

      const balance = await this.contract.getUserBalance(userId);
      const ethBalance = await this.provider.getBalance(walletAddress);

      return {
        userId,
        address: walletAddress,
        balance: balance.toString(), // Chuyển BigInt sang string trực tiếp
        balanceInEth: formatEther(ethBalance),
      };
    } catch (error: any) {
      console.error('❌ Get balance error:', error);
      return null;
    }
  }

  // services/ethersService.ts - Sửa hàm registerUserWallet
  async registerUserWallet(userId: number): Promise<{ success: boolean; address?: string; error?: string }> {
    try {
      await this.initialize();
      if (!this.contract || !this.ownerWallet) throw new Error('Not initialized');

      // Kiểm tra xem user đã có ví trong contract chưa
      const existingAddress = await this.contract.userWallets(userId);
      if (existingAddress !== ZeroAddress) {
        console.log('ℹ️ User already registered in contract');
        
        // Kiểm tra xem có private key không
        const existingPrivateKey = await walletService.getUserPrivateKey(userId);
        if (existingPrivateKey) {
          return { 
            success: false, 
            error: 'User already registered', 
            address: existingAddress 
          };
        } else {
          // User có trong contract nhưng không có private key -> cần tạo lại private key
          // TRONG THỰC TẾ, ĐÂY LÀ TÌNH HUỐNG NGUY HIỂM! 
          // Chúng ta không thể khôi phục private key từ address
          return { 
            success: false, 
            error: 'User registered but private key lost', 
            address: existingAddress 
          };
        }
      }

      // Tạo ví mới và lưu private key
      console.log('🔐 Creating new wallet for user:', userId);
      const { address: walletAddress, privateKey } = await walletService.createUserWallet(userId);
      console.log('✅ Wallet created:', walletAddress);

      // QUAN TRỌNG: Chuyển ETH từ owner wallet để trả phí gas
      console.log('💸 Funding wallet with ETH for gas...');
      const fundTx = await this.ownerWallet.sendTransaction({
        to: walletAddress,
        value: parseEther('0.1') // Chuyển 0.1 ETH để trả gas
      });
      await fundTx.wait();
      console.log('✅ Wallet funded with ETH');

      // Đăng ký ví với contract
      const tx = await this.contract.registerUserWallet(userId, walletAddress);
      const receipt = await tx.wait();
      console.log('✅ Wallet registered. TX hash:', receipt.hash);

      return { success: true, address: walletAddress };
    } catch (error: any) {
      console.error('❌ Register wallet error:', error);
      return { success: false, error: error.message };
    }
  }

  async mintCoinsToUser(userId: number, amount: number): Promise<TransferResult> {
    try {
      await this.initialize();
      if (!this.contract || !this.ownerWallet) throw new Error('Not initialized');

      const walletAddress = await this.contract.userWallets(userId);
      if (walletAddress === ZeroAddress) return { success: false, error: 'User not registered' };

      // SỬA: Truyền trực tiếp số COIN, không chuyển đổi thành wei
      const amountInWei = BigInt(amount); // Contract sẽ tự nhân với 10^decimals

      console.log('💰 Minting:', amount, 'COIN');

      const tx = await this.contract.mintCoins(walletAddress, amountInWei);
      
      const receipt = await tx.wait();

      const newBalance = await this.contract.getUserBalance(userId);

      return {
        success: receipt.status === 1,
        txHash: receipt.hash,
        gasUsed: receipt.gasUsed?.toString(),
        toBalance: formatEther(newBalance),
      };
    } catch (error: any) {
      console.error('❌ Mint coins error:', error);
      return { success: false, error: error.message };
    }
}

  async transferCoins(fromUserId: number, toUserId: number, amount: number, fromPrivateKey: string): Promise<TransferResult> {
    try {
      await this.initialize();
      if (!this.contract || !this.provider) throw new Error('Not initialized');
      
      const fromAddress = await this.contract.userWallets(fromUserId);
      const toAddress = await this.contract.userWallets(toUserId);
      if (fromAddress === ZeroAddress) return { success: false, error: 'Sender not registered' };
      if (toAddress === ZeroAddress) return { success: false, error: 'Receiver not registered' };

      // Check if sender has enough ETH for gas
      const ethBalance = await this.provider.getBalance(fromAddress);
      const ethBalanceInEth = parseFloat(formatEther(ethBalance));
      console.log(`⛽ Sender ETH balance: ${ethBalanceInEth} ETH`);

      if (ethBalanceInEth < 0.001) {
        console.log('⚠️ Insufficient ETH for gas, funding wallet...');
        const fundResult = await this.fundUserWalletWithETH(fromUserId, '0.1');
        if (!fundResult.success) {
          return { success: false, error: 'Unable to fund wallet with ETH for gas fees' };
        }
      }

      // await this.debugTransferConditions(fromUserId, toUserId, amount);

      // Kiểm tra số dư trước khi chuyển
      const fromBalance = await this.contract.getUserBalance(fromUserId);
      const fromBalanceWei = await this.contract.balanceOf(fromAddress);
      console.log('💰 Sender balance:', formatEther(fromBalance), 'COIN');
      console.log('💰 Sender balance (wei):', fromBalanceWei.toString());
      
      if (fromBalance < BigInt(amount)) {
        return { success: false, error: `Insufficient balance. You have ${formatEther(fromBalance)} COIN` };
      }

      const wallet = new Wallet(fromPrivateKey, this.provider);
      const contractWithSigner = this.contract.connect(wallet) as CoinContract;

      // SỬA: Dùng amount trực tiếp vì contract đã xử lý decimals
      const amountToSend = BigInt(amount);
      console.log('🔀 Transferring:', amountToSend, 'COIN');

      let tx;
      if (contractWithSigner.transferByUserId) {
        console.log('🔄 Using transferByUserId');
        tx = await contractWithSigner.transferByUserId(toUserId, amountToSend);
      } else if (contractWithSigner.transfer) {
        console.log('🔄 Using transfer with address');
        tx = await contractWithSigner.transfer(toAddress, amountToSend);
      } else {
        return { success: false, error: 'No transfer function available in contract' };
      }

      const receipt = await tx.wait();
      const newFromBalance = await this.contract.getUserBalance(fromUserId);
      const newToBalance = await this.contract.getUserBalance(toUserId);

      return {
        success: true,
        txHash: receipt.hash,
        gasUsed: receipt.gasUsed?.toString(),
        fromBalance: formatEther(newFromBalance),
        toBalance: formatEther(newToBalance),
      };
    } catch (error: any) {
      console.error('❌ Transfer error:', error);
      if (error.revert) {
        console.error('🔄 Revert reason:', error.revert);
      }
      if (error.data) {
        console.error('📊 Error data:', error.data);
      }
      
      return { success: false, error: error.message };
    }
  }
  // Fund user wallet with ETH for gas fees
  async fundUserWalletWithETH(userId: number, ethAmount: string = '0.1'): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      await this.initialize();
      if (!this.contract || !this.ownerWallet) throw new Error('Not initialized');

      const walletAddress = await this.contract.userWallets(userId);
      if (walletAddress === ZeroAddress) {
        return { success: false, error: 'User wallet not registered' };
      }

      console.log(`💸 Funding wallet ${walletAddress} with ${ethAmount} ETH...`);
      const tx = await this.ownerWallet.sendTransaction({
        to: walletAddress,
        value: parseEther(ethAmount)
      });
      const receipt = await tx.wait();
      
      const balance = await this.provider!.getBalance(walletAddress);
      console.log(`✅ Wallet funded. New ETH balance: ${formatEther(balance)} ETH`);

      return { success: true, txHash: receipt.hash };
    } catch (error: any) {
      console.error('❌ Fund wallet error:', error);
      return { success: false, error: error.message };
    }
  }
  async getTransactionHistory(userId: number): Promise<any[]> {
    try {
      await this.initialize();
      if (!this.contract || !this.provider) throw new Error('Not initialized');

      const walletAddress = await this.contract.userWallets(userId);
      if (walletAddress === ZeroAddress) {
        console.log('⚠️ User wallet not registered');
        return [];
      }

      console.log('📜 Fetching transaction history for:', walletAddress);

      // Lấy filter cho Transfer events
      const filter = this.contract.filters.Transfer();
      
      // Lấy tất cả events từ block 0 đến hiện tại
      const events = await this.contract.queryFilter(filter, 0, 'latest');

      // Lọc các transactions liên quan đến user
      const transactions = events
        .filter(event => {
          const from = event.args?.[0];
          const to = event.args?.[1];
          return (
            from?.toLowerCase() === walletAddress.toLowerCase() ||
            to?.toLowerCase() === walletAddress.toLowerCase()
          );
        })
        .map(event => {
          const from = event.args?.[0];
          const to = event.args?.[1];
          const value = event.args?.[2];
          
          const isSent = from?.toLowerCase() === walletAddress.toLowerCase();
          
          return {
            txHash: event.transactionHash,
            blockNumber: event.blockNumber,
            timestamp: new Date(), // Ganache không có timestamp chính xác, có thể lấy từ block
            from: from,
            to: to,
            amount: formatEther(value || BigInt(0)),
            type: isSent ? 'sent' : 'received',
          };
        })
        .sort((a, b) => b.blockNumber - a.blockNumber); // Sắp xếp mới nhất trước

      console.log(`✅ Found ${transactions.length} transactions`);
      return transactions;
    } catch (error: any) {
      console.error('❌ Get transaction history error:', error);
      return [];
    }
  }

  // Thêm hàm debug để kiểm tra trạng thái contract
  async debugContract(userId: number): Promise<void> {
    try {
      await this.initialize();
      if (!this.contract || !this.provider) throw new Error('Not initialized');

      console.log('🐛 === DEBUG CONTRACT ===');
      
      const walletAddress = await this.contract.userWallets(userId);
      console.log('👛 User wallet:', walletAddress);
      
      const userBalance = await this.contract.getUserBalance(userId);
      console.log('💰 getUserBalance:', userBalance.toString());
      
      const balanceOf = await this.contract.balanceOf(walletAddress);
      console.log('🏦 balanceOf:', balanceOf.toString());
      
      const totalSupply = await this.contract.totalSupply();
      console.log('📊 totalSupply:', totalSupply.toString());
      
      console.log('🐛 === END DEBUG ===');
    } catch (error) {
      console.error('❌ Debug error:', error);
    }
  }
}

export default new EthersService();