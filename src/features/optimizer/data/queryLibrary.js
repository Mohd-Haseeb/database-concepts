// queryLibrary.js
// Contains predefined SQL queries and their AST/Logical/Physical representations.

export const QUERY_LIBRARY = [
    {
        id: 'simple-select',
        name: 'Simple Selection',
        description: 'Retrieves active users ordered by signup date.',
        sql: `SELECT id, username, email
FROM Users
WHERE status = 'active'
ORDER BY signup_date DESC;`,
        stages: {
            ast: {
                type: 'SelectStatement',
                label: 'SELECT',
                details: 'Returns a result set',
                children: [
                    {
                        type: 'Projection',
                        label: 'Columns',
                        details: 'id, username, email'
                    },
                    {
                        type: 'FromClause',
                        label: 'FROM Users',
                        details: 'Target table'
                    },
                    {
                        type: 'WhereClause',
                        label: 'WHERE',
                        details: "status = 'active'"
                    },
                    {
                        type: 'OrderByClause',
                        label: 'ORDER BY',
                        details: 'signup_date DESC'
                    }
                ]
            },
            logical: {
                type: 'Project',
                label: 'π (id, username, email)',
                details: 'Project specific columns',
                children: [
                    {
                        type: 'Sort',
                        label: 'τ (signup_date DESC)',
                        details: 'Sort rows',
                        children: [
                            {
                                type: 'Filter',
                                label: 'σ (status = active)',
                                details: 'Filter rows',
                                children: [
                                    {
                                        type: 'Scan',
                                        label: 'Table: Users',
                                        details: 'Access base table'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            physical: {
                type: 'ProjectOperator',
                label: 'Projection',
                cost: 10,
                details: 'Keep only 3 columns in memory',
                note: 'Low overhead operation.',
                children: [
                    {
                        type: 'IndexScan',
                        label: 'Index Scan (status_idx)',
                        cost: 150,
                        details: "Read Users table using index on 'status'",
                        note: "Index Scan on 'status' avoids full table scan. Sort omitted because B+ tree fetches in order natively.",
                        highlight: true
                    }
                ]
            }
        }
    },
    {
        id: 'join-aggregate',
        name: 'Join + Group By',
        description: 'Finds the total order value per VIP user.',
        sql: `SELECT u.username, SUM(o.amount) as total
FROM Users u
JOIN Orders o ON u.id = o.user_id
WHERE u.tier = 'VIP'
GROUP BY u.username;`,
        stages: {
            ast: {
                type: 'SelectStatement',
                label: 'SELECT',
                details: 'Returns a result set',
                children: [
                    {
                        type: 'Projection',
                        label: 'Columns',
                        details: 'u.username, SUM(o.amount)'
                    },
                    {
                        type: 'FromClause',
                        label: 'FROM Users u',
                        details: 'Left Table'
                    },
                    {
                        type: 'JoinClause',
                        label: 'JOIN Orders o',
                        details: 'ON u.id = o.user_id'
                    },
                    {
                        type: 'WhereClause',
                        label: 'WHERE',
                        details: "u.tier = 'VIP'"
                    },
                    {
                        type: 'GroupByClause',
                        label: 'GROUP BY',
                        details: 'u.username'
                    }
                ]
            },
            logical: {
                type: 'Project',
                label: 'π (username, SUM(amount))',
                details: 'Final projection',
                children: [
                    {
                        type: 'Aggregate',
                        label: 'γ (username, sum(amount))',
                        details: 'Group By',
                        children: [
                            {
                                type: 'Join',
                                label: '⨝ (u.id = o.user_id)',
                                details: 'Inner Join',
                                children: [
                                    {
                                        type: 'Filter',
                                        label: 'σ (tier = VIP)',
                                        details: 'Filter Users',
                                        children: [
                                            { type: 'Scan', label: 'Table: Users', details: '' }
                                        ]
                                    },
                                    { type: 'Scan', label: 'Table: Orders', details: '' }
                                ]
                            }
                        ]
                    }
                ]
            },
            physical: {
                type: 'ProjectOperator',
                label: 'Projection',
                cost: 20,
                details: 'Format final output',
                note: '',
                children: [
                    {
                        type: 'HashAggregate',
                        label: 'Hash Aggregate',
                        cost: 300,
                        details: 'Hash-based grouping on username',
                        highlight: true,
                        note: 'Chose Hash Aggregate over Sort Aggregate because intermediate result fits in RAM.',
                        children: [
                            {
                                type: 'HashJoin',
                                label: 'Hash Join',
                                cost: 800,
                                details: 'Build Hash Table on Users, Probe with Orders',
                                highlight: true,
                                note: 'Hash Join is selected because the filtered Users set is small (VIPs only).',
                                children: [
                                    {
                                        type: 'IndexScan',
                                        label: 'Index Scan (tier_idx -> Users)',
                                        cost: 50,
                                        details: "Filter tier = 'VIP'",
                                        note: '',
                                    },
                                    {
                                        type: 'SeqScan',
                                        label: 'Sequential Scan (Orders)',
                                        cost: 1500,
                                        details: 'Read all Orders',
                                        note: 'Full scan on Orders is cheapest since we must evaluate all of them against the hash table.'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        }
    }
];
