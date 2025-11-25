require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",  // RPC Ganache GUI
      accounts: [
        "0xa9ca041c470d1708f73e9d24e01b2fc5ce34d0f18f7e727ba1ff0aaffbf7a51b",
        // có thể thêm các private key khác từ Ganache
      ],
    },
    localhost: {
      url: "http://127.0.0.1:8",
      chainId: 1337
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
