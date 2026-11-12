// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title BlockTask - a blockchain based task manager
/// @notice Users create tasks, assign them to other wallets, mark them done
///         or delete them. Every action emits an event, forming an
///         immutable audit trail.
contract BlockTask {
    enum Priority { Low, Medium, High }
    enum Status { Pending, Completed, Deleted }

    struct Task {
        uint256 id;
        string title;
        string description;
        address creator;
        address assignee;
        Priority priority;
        Status status;
        uint256 dueDate;      // unix timestamp, 0 = no deadline
        uint256 createdAt;
        uint256 completedAt;
    }

    uint256 public taskCount;
    mapping(uint256 => Task) private tasks;

    event TaskCreated(uint256 indexed id, address indexed creator, string title, Priority priority, uint256 dueDate);
    event TaskAssigned(uint256 indexed id, address indexed by, address indexed assignee);
    event TaskCompleted(uint256 indexed id, address indexed by, uint256 timestamp);
    event TaskDeleted(uint256 indexed id, address indexed by, uint256 timestamp);

    modifier exists(uint256 id) {
        require(id > 0 && id <= taskCount, "Task does not exist");
        _;
    }

    modifier notDeleted(uint256 id) {
        require(tasks[id].status != Status.Deleted, "Task deleted");
        _;
    }

    function createTask(
        string calldata title,
        string calldata description,
        Priority priority,
        uint256 dueDate
    ) external returns (uint256) {
        require(bytes(title).length > 0, "Title required");
        require(dueDate == 0 || dueDate > block.timestamp, "Due date must be in future");

        taskCount++;
        tasks[taskCount] = Task({
            id: taskCount,
            title: title,
            description: description,
            creator: msg.sender,
            assignee: msg.sender,
            priority: priority,
            status: Status.Pending,
            dueDate: dueDate,
            createdAt: block.timestamp,
            completedAt: 0
        });

        emit TaskCreated(taskCount, msg.sender, title, priority, dueDate);
        return taskCount;
    }

    function assignTask(uint256 id, address assignee) external exists(id) notDeleted(id) {
        Task storage t = tasks[id];
        require(msg.sender == t.creator, "Only creator can assign");
        require(t.status == Status.Pending, "Task not pending");
        require(assignee != address(0), "Invalid assignee");

        t.assignee = assignee;
        emit TaskAssigned(id, msg.sender, assignee);
    }

    function completeTask(uint256 id) external exists(id) notDeleted(id) {
        Task storage t = tasks[id];
        require(msg.sender == t.assignee || msg.sender == t.creator, "Not authorised");
        require(t.status == Status.Pending, "Already completed");

        t.status = Status.Completed;
        t.completedAt = block.timestamp;
        emit TaskCompleted(id, msg.sender, block.timestamp);
    }

    function deleteTask(uint256 id) external exists(id) notDeleted(id) {
        Task storage t = tasks[id];
        require(msg.sender == t.creator, "Only creator can delete");

        t.status = Status.Deleted;
        emit TaskDeleted(id, msg.sender, block.timestamp);
    }

    function getTask(uint256 id) external view exists(id) returns (Task memory) {
        return tasks[id];
    }

    /// @notice All non-deleted tasks created by or assigned to `user`
    function getTasksFor(address user) external view returns (Task[] memory) {
        uint256 n;
        for (uint256 i = 1; i <= taskCount; i++) {
            Task storage t = tasks[i];
            if (t.status != Status.Deleted && (t.creator == user || t.assignee == user)) n++;
        }
        Task[] memory result = new Task[](n);
        uint256 j;
        for (uint256 i = 1; i <= taskCount; i++) {
            Task storage t = tasks[i];
            if (t.status != Status.Deleted && (t.creator == user || t.assignee == user)) {
                result[j++] = t;
            }
        }
        return result;
    }
}
