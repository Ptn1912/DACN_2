const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SPayLater", function () {
  let SPayLater, spayLater;
  let deployer, customer;

  beforeEach(async function () {
    // Lấy signer
    [deployer, customer] = await ethers.getSigners();

    // Deploy contract với constructor nhận owner
    SPayLater = await ethers.getContractFactory("SPayLater");
    spayLater = await SPayLater.deploy(deployer.address);
    await spayLater.waitForDeployment();
  });

  it("Should register new customer", async function () {
    // Đăng ký customer
    await spayLater.registerCustomer(customer.address);

    const info = await spayLater.getCustomerInfo(customer.address);

    expect(info.creditLimit).to.equal(2000000);
    expect(info.availableCredit).to.equal(2000000);
    expect(info.usedCredit).to.equal(0);
  });

  it("Should create a transaction", async function () {
    // Đăng ký customer
    await spayLater.registerCustomer(customer.address);

    // Tạo transaction
    await spayLater.createTransaction(customer.address, 500000, "ORDER123", "{}");

    const info = await spayLater.getCustomerInfo(customer.address);
    expect(info.usedCredit).to.equal(500000);
    expect(info.availableCredit).to.equal(1500000);
  });

  it("Should make payment", async function () {
    // Đăng ký customer
    await spayLater.registerCustomer(customer.address);

    // Tạo transaction
    await spayLater.createTransaction(customer.address, 500000, "ORDER123", "{}");

    // Thanh toán bằng customer
    await spayLater.connect(customer).makePayment(1, { value: 500000 });

    const info = await spayLater.getCustomerInfo(customer.address);
    expect(info.usedCredit).to.equal(0);
    expect(info.availableCredit).to.equal(2000000);

    const txn = await spayLater.getTransaction(1);
    expect(txn.status).to.equal(2); // PAID
  });
});
