// services/walletService.ts
import { Wallet } from 'ethers';
import * as SecureStore from 'expo-secure-store';

class WalletService {
  private readonly PRIVATE_KEY_STORAGE_KEY = 'user_private_key';

  // Tạo và lưu private key cho user
  async createUserWallet(userId: number): Promise<{ address: string; privateKey: string }> {
    const wallet = Wallet.createRandom();
    
    // Lưu private key an toàn
    await SecureStore.setItemAsync(
      `${this.PRIVATE_KEY_STORAGE_KEY}_${userId}`, 
      wallet.privateKey
    );
    
    return {
      address: wallet.address,
      privateKey: wallet.privateKey
    };
  }

  // Lấy private key của user
  async getUserPrivateKey(userId: number): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(`${this.PRIVATE_KEY_STORAGE_KEY}_${userId}`);
    } catch (error) {
      console.error('Error getting private key:', error);
      return null;
    }
  }

  // Xóa private key khi logout
  async deleteUserPrivateKey(userId: number): Promise<void> {
    await SecureStore.deleteItemAsync(`${this.PRIVATE_KEY_STORAGE_KEY}_${userId}`);
  }

  // Kiểm tra user đã có ví chưa
  async hasUserWallet(userId: number): Promise<boolean> {
    const privateKey = await this.getUserPrivateKey(userId);
    return privateKey !== null;
  }
}

export default new WalletService();