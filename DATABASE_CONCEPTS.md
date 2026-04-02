# Database Internals: Technical Concepts Reference

This document serves as a high-level technical reference for the core database engine concepts visualized in this application. These concepts are foundational to understanding how modern Relational Database Management Systems (RDBMS) like PostgreSQL, MySQL, and SQLite function under the hood.

---

## 1. Buffer Pool Management
Because disk I/O is the slowest operation in a database, engines maintain an in-memory **Buffer Pool** to cache frequently accessed data pages (blocks). Managing this limited memory efficiently is critical for performance.

### Eviction Policies
When the buffer pool is full and a new page must be loaded from disk, the system must choose a "victim" page to evict.
*   **LRU (Least Recently Used)**: Evicts the page that has not been accessed for the longest time. Assumes temporal locality (recently accessed data will likely be accessed again).
*   **LFU (Least Frequently Used)**: Tracks the *frequency* of access. Evicts the page with the lowest access count. Good for preventing "cache pollution" from sequential scans (where many pages are read once and never again).
*   **Clock Sweep**: A highly efficient approximation of LRU. Pages are arranged in a circular buffer with a "Reference Bit". A clock hand sweeps through; if the bit is `1`, it is set to `0` and spared. If the bit is `0`, the page is evicted. This avoids the overhead of maintaining complex timestamps or counters.

### Dirty Pages & Pinned Pages
*   **Dirty Page**: A page that has been modified in memory but not yet written back to disk. It *must* be flushed to disk before it can be evicted.
*   **Pinned Page**: A page currently in active use by a thread. It cannot be evicted until unpinned.

---

## 2. Query Optimizer & Execution
When a database receives a SQL query, it must decide the most efficient way to execute it.

1.  **Parser / AST Translation**: The SQL string is parsed into an Abstract Syntax Tree (AST), checking for syntax errors.
2.  **Logical Plan**: The AST is converted into relational algebra operators (e.g., `SeqScan`, `Filter`, `Projection`).
3.  **Physical Execution Plan**: The Optimizer generates concrete algorithms for the logical operators. For example, a logical `Join` might become a `HashJoin` or a `NestedLoopJoin` depending on table sizes and available indexes.

The resulting plan is executed in a pipeline format (often using the **Volcano Iterator Model**), where each operator pulls rows from its child operator one by one.

---

## 3. Join Algorithms
Joins are often the most expensive operations in a relational database. The engine chooses an implementation based on available memory and indexes.

*   **Nested Loop Join**: The most basic algorithm. For every row in the outer table, it scans the entire inner table. 
    *   *Time Complexity*: $O(N \times M)$
    *   *Usage*: Usually a fallback, or highly optimized using indexes (Index Nested Loop Join).
*   **Hash Join**: Builds a hash table in memory using the join key from the smaller (outer) table. Then, it probes this hash table for every row in the larger (inner) table.
    *   *Time Complexity*: $O(N + M)$ expected, assuming a good hash distribution.
    *   *Usage*: Excellent for equijoins (e.g., `A.id = B.id`) when no indexes exist.
*   **Sort-Merge Join**: Both tables are sorted by the join key. The engine then uses two pointers to linearly scan and merge matching rows.
    *   *Time Complexity*: $O(N \log N + M \log M)$ (dominated by the sort phase).
    *   *Usage*: Optimal if the inputs are *already* sorted (e.g., via a B+ Tree index) or if the query requires sorted output (an `ORDER BY` clause).

---

## 4. Concurrency Control (Transactions)
Databases use Concurrency Control protocols to allow multiple users to read and write simultaneously while preserving isolation and consistency (the "I" and "C" in ACID).

*   **Two-Phase Locking (2PL)**: 
    *   *Growing Phase*: A transaction acquires all necessary locks (Shared/Read locks or Exclusive/Write locks) as it executes.
    *   *Shrinking Phase*: Once the transaction releases its *first* lock, it cannot acquire any new ones.
    *   *Drawback*: Prone to Deadlocks, requiring the engine to actively run deadlock detection algorithms (e.g., cycle detection in a wait-for graph).
*   **Optimistic Concurrency Control (OCC)**:
    *   Transactions execute entirely in a private workspace without acquiring locks.
    *   When the transaction attempts to commit, a **Validation Phase** checks if any other transaction modified the same data. If a conflict is detected, the transaction is aborted and must retry.
    *   *Usage*: Great for read-heavy workloads where conflicts are rare. Terrible for write-heavy workloads.

---

## 5. Write-Ahead Logging (WAL) & Crash Recovery
Databases guarantee **Atomicity** and **Durability** even across sudden power failures using Write-Ahead Logging, typically modeled after the **ARIES** algorithm.

*   **The WAL Rule**: Before a transaction can be considered "COMMITTED" and acknowledged to the user, its log records *must* be physically flushed to the persistent log file on disk. The actual Data Pages can be updated later (Steal/No-Force policy).
*   **Log Sequence Number (LSN)**: A monotonically increasing ID assigned to every log record.

### ARIES Recovery Phases
If the system crashes, RAM (the buffer pool and active log tail) is instantly wiped. Upon restarting, the engine runs recovery in three sweeps over the persistent WAL:
1.  **Analysis Pass**: Scans forward from the last known Checkpoint to determine which transactions were active at the time of the crash, and identify which data pages might be dirty on disk.
2.  **REDO Pass (Sweep Forward)**: Repeats history. Scans forward, ruthlessly reapplying *every* logged change (even for uncommitted transactions) to return the data pages to the exact state they were in when the engine crashed.
3.  **UNDO Pass (Sweep Backward)**: Scans backward from the end of the log. Any transaction identified as uncommitted or aborted during the Analysis pass has its actions reversed, ensuring Atomicity.
