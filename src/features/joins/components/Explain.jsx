import React from 'react';
import './Explain.css';

export default function Explain({ joinType, algo, isIndexed = false }) {

    const getAlgoDetails = () => {
        switch (algo) {
            case 'BTREE_SEARCH':
                return {
                    title: 'B+ Tree Index Search & Deep Disk I/O',
                    icon: '🌲',
                    description: `Databases use B+ Trees to organize index data so it can be searched incredibly fast. This prevents the database from having to perform an expensive O(N) "Full Table Scan" on the disk for every query.`,
                    howItWorks: `1. Logical Search: The database compares the query against the "Keys" in the Root and Internal nodes, traversing down to a Leaf Node. 
2. Deep Disk I/O: The Leaf Node contains a physical memory pointer. The Database must now go to the physical disk, wait for the rotational latency to SEEK the correct 8KB Page, and extract the matching row payload.`,
                    complexity: 'O(log N) Search + O(1) Disk Fetch',
                    complexityDesc: `A billion-row table typically only has a B+ Tree depth of 3 or 4. This means finding any row takes merely 3 or 4 logical memory jumps, followed by a single physical disk lookup.`,
                    useCase: `How do Indexes help in faster joins? When performing an "Index Nested Loop Join", the Outer Table loops through its rows. But instead of scanning the Inner Table sequentially (O(N*M)), it fires an O(log M) search query directly into the Inner Table's B+ Tree for every row!`
                };
            case 'HASH_JOIN':
                return {
                    title: 'Hash Join',
                    icon: '🪣',
                    description: `To execute this ${joinType} JOIN, the database is using a Hash Join. This is typically the go-to algorithm for joining large, unsorted tables.`,
                    howItWorks: `Phase 1 (Build): The database scans the smaller table (usually inner) and applies a hash function to the join key, placing each row into a "Hash Bucket" in memory. Phase 2 (Probe): It scans the larger outer table, hashes its join key, and jumps instantly to the correct bucket to find matches.`,
                    complexity: 'O(N + M)',
                    complexityDesc: `Instead of looping M times for every N, it only passes through each table once. Creating the hash table takes O(M), and probing takes O(N). Fast!`,
                    useCase: `Most modern databases prefer Hash Joins for large, unsorted data. However, if the tables are so massive the Hash Table can't fit in RAM, it has to spill to disk (Grace Hash Join), which kills performance.`
                };
            case 'MERGE_JOIN':
                return {
                    title: 'Merge Join',
                    icon: '🔀',
                    description: `To execute this ${joinType} JOIN, the database is using a Sort-Merge Join. This is extremely fast if the tables are already sorted by an index.`,
                    howItWorks: `Phase 1 (Sort): If not already sorted, the database sorts both tables by the Join Key (this is the expensive part). Phase 2 (Merge): It uses two pointers, one for each table. They move down the lists like a zipper. If Left < Right, advance Left. If Right < Left, advance Right. If they match, output the row!`,
                    complexity: 'O(N log N + M log M) or O(N + M)',
                    complexityDesc: `If the data is NOT sorted, sorting takes O(N log N). If the data is ALREADY sorted (because of a B-Tree Index), the join itself only takes O(N + M).`,
                    useCase: `Databases love Merge Joins when joining on Primary Keys or Foreign Keys that are already indexed. The data comes off the disk pre-sorted, making the merge phase incredibly effcient.`
                };
            case 'NESTED_LOOP':
            default:
                if (isIndexed) {
                    return {
                        title: 'Index Nested Loop Join',
                        icon: '⚡',
                        description: `To execute this ${joinType} JOIN, the database is exploiting a B+ Tree Index on the Inner Table to massively speed up the execution.`,
                        howItWorks: `The database takes the Outer Row, and instead of scanning the Inner Table sequentially, it fires an O(log M) search query directly into the Inner Table's B+ Tree. It instantly jumps to the exact matched row and emits the result.`,
                        complexity: 'O(N * log M)',
                        complexityDesc: `Instead of O(N * M), the Index drastically reduces the inner loop overhead. If M=1,000,000 but the B+ tree depth is 3, the complexity drops from 1,000,000 operations per outer row down to just 3 operations per outer row!`,
                        useCase: `Index Nested Loop joins are the most common and fastest join algorithms used in OLTP databases when the Outer Table is relatively small and the Inner Table has an index on the join key.`
                    };
                } else {
                    return {
                        title: 'Nested Loop Join',
                        icon: '🔄',
                        description: `To execute this ${joinType} JOIN, the database is using a Nested Loop algorithm. This is the most fundamental (and often the slowest) way a database combines two tables.`,
                        howItWorks: `The database designates one table as the Outer Loop (Users) and the other as the Inner Loop (Orders). For every single row in the Outer table, it scans through every single row in the Inner table looking for a match.`,
                        complexity: 'O(N * M)',
                        complexityDesc: `If Table A has 1,000 rows and Table B has 1,000 rows, the database must perform 1,000,000 operations. This is why missing indexes on large tables can completely freeze an application.`,
                        useCase: `Databases only use pure Nested Loops if tables are extremely small, or the join condition doesn't use equality (e.g., ON A.value > B.value).`
                    };
                }
        }
    };

    const details = getAlgoDetails();

    return (
        <div className="explain-container panel">
            <h3>
                <span className="icon">{details.icon}</span> Database Internals: {details.title}
            </h3>

            <p className="intro">
                {details.description}
            </p>

            <div className="concept-blocks">
                <div className="concept">
                    <h4>How it works</h4>
                    <p>{details.howItWorks}</p>
                </div>

                <div className={`concept ${algo === 'NESTED_LOOP' && !isIndexed ? 'warning' : 'tip'}`}>
                    <h4>Time Complexity: {details.complexity}</h4>
                    <p>{details.complexityDesc}</p>
                </div>

                <div className="concept tip">
                    <h4>When do databases actually use this?</h4>
                    <p>{details.useCase}</p>
                </div>
            </div>
        </div>
    );
}
