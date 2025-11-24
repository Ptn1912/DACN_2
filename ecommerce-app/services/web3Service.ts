// // services/web3Service.ts
// import Web3 from "web3";
// import contractConfig from "../contract-config.json";

// interface TransferResult {
//   success: boolean;
//   txHash?: string;
//   error?: string;
//   gasUsed?: string;
//   fromBalance?: string;
//   toBalance?: string;
// }

// interface UserBalance {
//   userId: number;
//   address: string;
//   balance: string;
//   balanceInEth: string;
// }

// class Web3Service {
//   private web3: Web3;
//   private contract: any;
//   private contractAddress: string;
//   private ownerAddress: string;
//   private ownerPrivateKey: string;

//   constructor() {
//     // Connect to local Hardhat node
//     this.web3 = new Web3("http://192.168.1.14:8545");

//     // Load contract
//     this.contractAddress = contractConfig.address;
//     this.contract = new this.web3.eth.Contract(
//       contractConfig.abi,
//       this.contractAddress
//     );

//     // Owner account (first account from Hardhat)
//     this.ownerAddress = contractConfig.deployer;
//     // In production, store private key securely!
//     this.ownerPrivateKey =
//       "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
//   }
// //   async mintInitialCoins(userId: number, amount: number = 100) {
// //     // Owner mint coins for new user
// //     const ownerPrivateKey =
// //       "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
// //     // ... implement mint logic
// //   }
//   // Get user balance by userId
//   async getUserBalance(userId: number): Promise<UserBalance | null> {
//     try {
//       const walletAddress = await this.contract.methods
//         .userWallets(userId)
//         .call();

//       if (walletAddress === "0x0000000000000000000000000000000000000000") {
//         return null;
//       }

//       const balance = await this.contract.methods.getUserBalance(userId).call();
//       const ethBalance = await this.web3.eth.getBalance(walletAddress);

//       return {
//         userId,
//         address: walletAddress,
//         balance: balance.toString(),
//         balanceInEth: this.web3.utils.fromWei(ethBalance, "ether"),
//       };
//     } catch (error) {
//       console.error("Get balance error:", error);
//       return null;
//     }
//   }

//   // Register new user wallet
//   async registerUserWallet(
//     userId: number
//   ): Promise<{ success: boolean; address?: string; error?: string }> {
//     try {
//       // Create new account for user
//       const account = this.web3.eth.accounts.create();

//       // Send transaction to register user
//       const tx = this.contract.methods.registerUserWallet(
//         userId,
//         account.address
//       );
//       const gas = await tx.estimateGas({ from: this.ownerAddress });

//       const signedTx = await this.web3.eth.accounts.signTransaction(
//         {
//           to: this.contractAddress,
//           data: tx.encodeABI(),
//           gas: gas.toString(),
//           gasPrice: await this.web3.eth.getGasPrice(),
//         },
//         this.ownerPrivateKey
//       );

//       const receipt = await this.web3.eth.sendSignedTransaction(
//         signedTx.rawTransaction!
//       );

//       return {
//         success: true,
//         address: account.address,
//       };
//     } catch (error: any) {
//       console.error("Register wallet error:", error);
//       return {
//         success: false,
//         error: error.message,
//       };
//     }
//   }

//   // Mint coins to user (reward system)
//   async mintCoinsToUser(
//     userId: number,
//     amount: number
//   ): Promise<TransferResult> {
//     try {
//       const walletAddress = await this.contract.methods
//         .userWallets(userId)
//         .call();

//       if (walletAddress === "0x0000000000000000000000000000000000000000") {
//         return {
//           success: false,
//           error: "User not registered",
//         };
//       }

//       const tx = this.contract.methods.mintCoins(walletAddress, amount);
//       const gas = await tx.estimateGas({ from: this.ownerAddress });

//       const signedTx = await this.web3.eth.accounts.signTransaction(
//         {
//           to: this.contractAddress,
//           data: tx.encodeABI(),
//           gas: gas.toString(),
//           gasPrice: await this.web3.eth.getGasPrice(),
//         },
//         this.ownerPrivateKey
//       );

//       const receipt = await this.web3.eth.sendSignedTransaction(
//         signedTx.rawTransaction!
//       );
//       const newBalance = await this.contract.methods
//         .getUserBalance(userId)
//         .call();

//       return {
//         success: true,
//         txHash: receipt.transactionHash.toString(),
//         gasUsed: receipt.gasUsed.toString(),
//         toBalance: newBalance.toString(),
//       };
//     } catch (error: any) {
//       console.error("Mint coins error:", error);
//       return {
//         success: false,
//         error: error.message,
//       };
//     }
//   }

//   // Transfer coins between users
//   async transferCoins(
//     fromUserId: number,
//     toUserId: number,
//     amount: number,
//     fromPrivateKey: string
//   ): Promise<TransferResult> {
//     try {
//       // Get wallet addresses
//       const fromAddress = await this.contract.methods
//         .userWallets(fromUserId)
//         .call();
//       const toAddress = await this.contract.methods
//         .userWallets(toUserId)
//         .call();

//       if (fromAddress === "0x0000000000000000000000000000000000000000") {
//         return { success: false, error: "Sender not registered" };
//       }

//       if (toAddress === "0x0000000000000000000000000000000000000000") {
//         return { success: false, error: "Receiver not registered" };
//       }

//       // Check balance
//       const fromBalance = await this.contract.methods
//         .getUserBalance(fromUserId)
//         .call();
//       if (parseInt(fromBalance) < amount) {
//         return { success: false, error: "Insufficient balance" };
//       }

//       // Prepare transaction
//       const amountInWei = this.web3.utils.toWei(amount.toString(), "ether");
//       const tx = this.contract.methods.transfer(toAddress, amountInWei);
//       const gas = await tx.estimateGas({ from: fromAddress });

//       const signedTx = await this.web3.eth.accounts.signTransaction(
//         {
//           to: this.contractAddress,
//           data: tx.encodeABI(),
//           gas: gas.toString(),
//           gasPrice: await this.web3.eth.getGasPrice(),
//         },
//         fromPrivateKey
//       );

//       const receipt = await this.web3.eth.sendSignedTransaction(
//         signedTx.rawTransaction!
//       );

//       // Get updated balances
//       const newFromBalance = await this.contract.methods
//         .getUserBalance(fromUserId)
//         .call();
//       const newToBalance = await this.contract.methods
//         .getUserBalance(toUserId)
//         .call();

//       return {
//         success: true,
//         txHash: receipt.transactionHash.toString(),
//         gasUsed: receipt.gasUsed.toString(),
//         fromBalance: newFromBalance.toString(),
//         toBalance: newToBalance.toString(),
//       };
//     } catch (error: any) {
//       console.error("Transfer error:", error);
//       return {
//         success: false,
//         error: error.message,
//       };
//     }
//   }

//   // Get transaction history
//   async getTransactionHistory(
//     userId: number,
//     limit: number = 20
//   ): Promise<any[]> {
//     try {
//       const walletAddress = await this.contract.methods
//         .userWallets(userId)
//         .call();

//       if (walletAddress === "0x0000000000000000000000000000000000000000") {
//         return [];
//       }

//       // Get Transfer events
//       const events = await this.contract.getPastEvents("Transfer", {
//         filter: {
//           $or: [{ from: walletAddress }, { to: walletAddress }],
//         },
//         fromBlock: 0,
//         toBlock: "latest",
//       });

//       // Format events
//       const transactions = await Promise.all(
//         events.slice(-limit).map(async (event: any) => {
//           const block = await this.web3.eth.getBlock(event.blockNumber);
//           const amount = this.web3.utils.fromWei(
//             event.returnValues.value,
//             "ether"
//           );

//           return {
//             txHash: event.transactionHash,
//             blockNumber: event.blockNumber,
//             timestamp: new Date(Number(block.timestamp) * 1000),
//             from: event.returnValues.from,
//             to: event.returnValues.to,
//             amount,
//             type:
//               event.returnValues.from.toLowerCase() ===
//               walletAddress.toLowerCase()
//                 ? "sent"
//                 : "received",
//           };
//         })
//       );

//       return transactions.reverse();
//     } catch (error) {
//       console.error("Get history error:", error);
//       return [];
//     }
//   }

//   // Get all registered users
//   async getAllUsers(maxUsers: number = 100): Promise<UserBalance[]> {
//     const users: UserBalance[] = [];

//     for (let i = 1; i <= maxUsers; i++) {
//       const user = await this.getUserBalance(i);
//       if (user) {
//         users.push(user);
//       } else {
//         break; // Stop when no more users found
//       }
//     }

//     return users;
//   }
// }

// export default new Web3Service();
