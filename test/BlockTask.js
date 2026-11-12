const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("BlockTask", function () {
  let bt, owner, alice, bob;

  beforeEach(async () => {
    [owner, alice, bob] = await ethers.getSigners();
    bt = await (await ethers.getContractFactory("BlockTask")).deploy();
  });

  it("creates a task with correct fields", async () => {
    const due = (await time.latest()) + 86400;
    await expect(bt.connect(alice).createTask("Write report", "Mini project", 2, due))
      .to.emit(bt, "TaskCreated");
    const t = await bt.getTask(1);
    expect(t.title).to.equal("Write report");
    expect(t.creator).to.equal(alice.address);
    expect(t.assignee).to.equal(alice.address);
    expect(t.priority).to.equal(2);
    expect(t.status).to.equal(0);
    expect(await bt.taskCount()).to.equal(1);
  });

  it("rejects empty title and past due date", async () => {
    await expect(bt.createTask("", "x", 0, 0)).to.be.revertedWith("Title required");
    await expect(bt.createTask("t", "x", 0, 1)).to.be.revertedWith("Due date must be in future");
  });

  it("lets creator assign and assignee complete", async () => {
    await bt.connect(alice).createTask("T", "d", 1, 0);
    await expect(bt.connect(alice).assignTask(1, bob.address))
      .to.emit(bt, "TaskAssigned").withArgs(1, alice.address, bob.address);
    await expect(bt.connect(bob).completeTask(1)).to.emit(bt, "TaskCompleted");
    expect((await bt.getTask(1)).status).to.equal(1);
  });

  it("blocks unauthorised actions", async () => {
    await bt.connect(alice).createTask("T", "d", 1, 0);
    await expect(bt.connect(bob).assignTask(1, bob.address)).to.be.revertedWith("Only creator can assign");
    await expect(bt.connect(bob).completeTask(1)).to.be.revertedWith("Not authorised");
    await expect(bt.connect(bob).deleteTask(1)).to.be.revertedWith("Only creator can delete");
  });

  it("prevents double completion", async () => {
    await bt.connect(alice).createTask("T", "d", 1, 0);
    await bt.connect(alice).completeTask(1);
    await expect(bt.connect(alice).completeTask(1)).to.be.revertedWith("Already completed");
  });

  it("soft deletes and hides from getTasksFor", async () => {
    await bt.connect(alice).createTask("A", "d", 0, 0);
    await bt.connect(alice).createTask("B", "d", 0, 0);
    await bt.connect(alice).deleteTask(1);
    const list = await bt.getTasksFor(alice.address);
    expect(list.length).to.equal(1);
    expect(list[0].title).to.equal("B");
    await expect(bt.connect(alice).completeTask(1)).to.be.revertedWith("Task deleted");
  });

  it("shows assigned tasks to the assignee", async () => {
    await bt.connect(alice).createTask("A", "d", 0, 0);
    await bt.connect(alice).assignTask(1, bob.address);
    expect((await bt.getTasksFor(bob.address)).length).to.equal(1);
  });

  it("reverts for unknown task", async () => {
    await expect(bt.getTask(99)).to.be.revertedWith("Task does not exist");
  });
});
