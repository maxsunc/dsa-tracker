const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const problems = [
  // ── Arrays ──────────────────────────────────────────────
  { leetcodeNumber: 1,    title: 'Two Sum',                             difficulty: 'easy',   category: 'Arrays',              pattern: 'Hash Map',          leetcodeUrl: 'https://leetcode.com/problems/two-sum/' },
  { leetcodeNumber: 121,  title: 'Best Time to Buy and Sell Stock',     difficulty: 'easy',   category: 'Arrays',              pattern: 'Sliding Window',    leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' },
  { leetcodeNumber: 217,  title: 'Contains Duplicate',                  difficulty: 'easy',   category: 'Arrays',              pattern: 'Hash Map',          leetcodeUrl: 'https://leetcode.com/problems/contains-duplicate/' },
  { leetcodeNumber: 238,  title: 'Product of Array Except Self',        difficulty: 'medium', category: 'Arrays',              pattern: 'Prefix Sum',        leetcodeUrl: 'https://leetcode.com/problems/product-of-array-except-self/' },
  { leetcodeNumber: 53,   title: 'Maximum Subarray',                    difficulty: 'medium', category: 'Arrays',              pattern: "Kadane's",          leetcodeUrl: 'https://leetcode.com/problems/maximum-subarray/' },
  { leetcodeNumber: 152,  title: 'Maximum Product Subarray',            difficulty: 'medium', category: 'Arrays',              pattern: 'Dynamic Programming', leetcodeUrl: 'https://leetcode.com/problems/maximum-product-subarray/' },
  { leetcodeNumber: 153,  title: 'Find Minimum in Rotated Sorted Array', difficulty: 'medium', category: 'Arrays',             pattern: 'Binary Search',     leetcodeUrl: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/' },
  { leetcodeNumber: 33,   title: 'Search in Rotated Sorted Array',      difficulty: 'medium', category: 'Arrays',              pattern: 'Binary Search',     leetcodeUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array/' },
  { leetcodeNumber: 15,   title: '3Sum',                                difficulty: 'medium', category: 'Arrays',              pattern: 'Two Pointers',      leetcodeUrl: 'https://leetcode.com/problems/3sum/' },
  { leetcodeNumber: 11,   title: 'Container With Most Water',           difficulty: 'medium', category: 'Arrays',              pattern: 'Two Pointers',      leetcodeUrl: 'https://leetcode.com/problems/container-with-most-water/' },
  { leetcodeNumber: 49,   title: 'Group Anagrams',                      difficulty: 'medium', category: 'Arrays',              pattern: 'Hash Map',          leetcodeUrl: 'https://leetcode.com/problems/group-anagrams/' },
  { leetcodeNumber: 347,  title: 'Top K Frequent Elements',             difficulty: 'medium', category: 'Arrays',              pattern: 'Bucket Sort',       leetcodeUrl: 'https://leetcode.com/problems/top-k-frequent-elements/' },
  { leetcodeNumber: 271,  title: 'Encode and Decode Strings',           difficulty: 'medium', category: 'Arrays',              pattern: 'String Manipulation', leetcodeUrl: 'https://leetcode.com/problems/encode-and-decode-strings/' },
  { leetcodeNumber: 128,  title: 'Longest Consecutive Sequence',        difficulty: 'medium', category: 'Arrays',              pattern: 'Hash Set',          leetcodeUrl: 'https://leetcode.com/problems/longest-consecutive-sequence/' },

  // ── Two Pointers ────────────────────────────────────────
  { leetcodeNumber: 125,  title: 'Valid Palindrome',                    difficulty: 'easy',   category: 'Two Pointers',        pattern: 'Two Pointers',      leetcodeUrl: 'https://leetcode.com/problems/valid-palindrome/' },
  { leetcodeNumber: 167,  title: 'Two Sum II',                          difficulty: 'medium', category: 'Two Pointers',        pattern: 'Two Pointers',      leetcodeUrl: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/' },
  { leetcodeNumber: 42,   title: 'Trapping Rain Water',                 difficulty: 'hard',   category: 'Two Pointers',        pattern: 'Two Pointers',      leetcodeUrl: 'https://leetcode.com/problems/trapping-rain-water/' },

  // ── Sliding Window ──────────────────────────────────────
  { leetcodeNumber: 3,    title: 'Longest Substring Without Repeating Characters', difficulty: 'medium', category: 'Sliding Window', pattern: 'Sliding Window', leetcodeUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
  { leetcodeNumber: 424,  title: 'Longest Repeating Character Replacement', difficulty: 'medium', category: 'Sliding Window',  pattern: 'Sliding Window',    leetcodeUrl: 'https://leetcode.com/problems/longest-repeating-character-replacement/' },
  { leetcodeNumber: 76,   title: 'Minimum Window Substring',            difficulty: 'hard',   category: 'Sliding Window',      pattern: 'Sliding Window',    leetcodeUrl: 'https://leetcode.com/problems/minimum-window-substring/' },
  { leetcodeNumber: 239,  title: 'Sliding Window Maximum',              difficulty: 'hard',   category: 'Sliding Window',      pattern: 'Monotonic Deque',   leetcodeUrl: 'https://leetcode.com/problems/sliding-window-maximum/' },

  // ── Stack ───────────────────────────────────────────────
  { leetcodeNumber: 20,   title: 'Valid Parentheses',                   difficulty: 'easy',   category: 'Stack',               pattern: 'Stack',             leetcodeUrl: 'https://leetcode.com/problems/valid-parentheses/' },
  { leetcodeNumber: 155,  title: 'Min Stack',                           difficulty: 'medium', category: 'Stack',               pattern: 'Stack',             leetcodeUrl: 'https://leetcode.com/problems/min-stack/' },
  { leetcodeNumber: 150,  title: 'Evaluate Reverse Polish Notation',    difficulty: 'medium', category: 'Stack',               pattern: 'Stack',             leetcodeUrl: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/' },
  { leetcodeNumber: 22,   title: 'Generate Parentheses',                difficulty: 'medium', category: 'Stack',               pattern: 'Backtracking',      leetcodeUrl: 'https://leetcode.com/problems/generate-parentheses/' },
  { leetcodeNumber: 739,  title: 'Daily Temperatures',                  difficulty: 'medium', category: 'Stack',               pattern: 'Monotonic Stack',   leetcodeUrl: 'https://leetcode.com/problems/daily-temperatures/' },
  { leetcodeNumber: 853,  title: 'Car Fleet',                           difficulty: 'medium', category: 'Stack',               pattern: 'Stack',             leetcodeUrl: 'https://leetcode.com/problems/car-fleet/' },
  { leetcodeNumber: 84,   title: 'Largest Rectangle in Histogram',      difficulty: 'hard',   category: 'Stack',               pattern: 'Monotonic Stack',   leetcodeUrl: 'https://leetcode.com/problems/largest-rectangle-in-histogram/' },

  // ── Binary Search ───────────────────────────────────────
  { leetcodeNumber: 704,  title: 'Binary Search',                       difficulty: 'easy',   category: 'Binary Search',       pattern: 'Binary Search',     leetcodeUrl: 'https://leetcode.com/problems/binary-search/' },
  { leetcodeNumber: 74,   title: 'Search a 2D Matrix',                  difficulty: 'medium', category: 'Binary Search',       pattern: 'Binary Search',     leetcodeUrl: 'https://leetcode.com/problems/search-a-2d-matrix/' },
  { leetcodeNumber: 875,  title: 'Koko Eating Bananas',                 difficulty: 'medium', category: 'Binary Search',       pattern: 'Binary Search',     leetcodeUrl: 'https://leetcode.com/problems/koko-eating-bananas/' },
  { leetcodeNumber: 4,    title: 'Median of Two Sorted Arrays',         difficulty: 'hard',   category: 'Binary Search',       pattern: 'Binary Search',     leetcodeUrl: 'https://leetcode.com/problems/median-of-two-sorted-arrays/' },

  // ── Linked Lists ────────────────────────────────────────
  { leetcodeNumber: 206,  title: 'Reverse Linked List',                 difficulty: 'easy',   category: 'Linked Lists',        pattern: 'Two Pointers',      leetcodeUrl: 'https://leetcode.com/problems/reverse-linked-list/' },
  { leetcodeNumber: 21,   title: 'Merge Two Sorted Lists',              difficulty: 'easy',   category: 'Linked Lists',        pattern: 'Two Pointers',      leetcodeUrl: 'https://leetcode.com/problems/merge-two-sorted-lists/' },
  { leetcodeNumber: 141,  title: 'Linked List Cycle',                   difficulty: 'easy',   category: 'Linked Lists',        pattern: 'Fast & Slow',       leetcodeUrl: 'https://leetcode.com/problems/linked-list-cycle/' },
  { leetcodeNumber: 143,  title: 'Reorder List',                        difficulty: 'medium', category: 'Linked Lists',        pattern: 'Fast & Slow',       leetcodeUrl: 'https://leetcode.com/problems/reorder-list/' },
  { leetcodeNumber: 19,   title: 'Remove Nth Node From End of List',    difficulty: 'medium', category: 'Linked Lists',        pattern: 'Two Pointers',      leetcodeUrl: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/' },
  { leetcodeNumber: 138,  title: 'Copy List with Random Pointer',       difficulty: 'medium', category: 'Linked Lists',        pattern: 'Hash Map',          leetcodeUrl: 'https://leetcode.com/problems/copy-list-with-random-pointer/' },
  { leetcodeNumber: 2,    title: 'Add Two Numbers',                     difficulty: 'medium', category: 'Linked Lists',        pattern: 'Linked List',       leetcodeUrl: 'https://leetcode.com/problems/add-two-numbers/' },
  { leetcodeNumber: 287,  title: 'Find the Duplicate Number',           difficulty: 'medium', category: 'Linked Lists',        pattern: 'Fast & Slow',       leetcodeUrl: 'https://leetcode.com/problems/find-the-duplicate-number/' },
  { leetcodeNumber: 146,  title: 'LRU Cache',                           difficulty: 'medium', category: 'Linked Lists',        pattern: 'Hash Map + DLL',    leetcodeUrl: 'https://leetcode.com/problems/lru-cache/' },
  { leetcodeNumber: 23,   title: 'Merge k Sorted Lists',                difficulty: 'hard',   category: 'Linked Lists',        pattern: 'Heap',              leetcodeUrl: 'https://leetcode.com/problems/merge-k-sorted-lists/' },
  { leetcodeNumber: 25,   title: 'Reverse Nodes in k-Group',            difficulty: 'hard',   category: 'Linked Lists',        pattern: 'Linked List',       leetcodeUrl: 'https://leetcode.com/problems/reverse-nodes-in-k-group/' },

  // ── Trees ───────────────────────────────────────────────
  { leetcodeNumber: 104,  title: 'Maximum Depth of Binary Tree',        difficulty: 'easy',   category: 'Trees',               pattern: 'DFS',               leetcodeUrl: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/' },
  { leetcodeNumber: 226,  title: 'Invert Binary Tree',                  difficulty: 'easy',   category: 'Trees',               pattern: 'DFS',               leetcodeUrl: 'https://leetcode.com/problems/invert-binary-tree/' },
  { leetcodeNumber: 100,  title: 'Same Tree',                           difficulty: 'easy',   category: 'Trees',               pattern: 'DFS',               leetcodeUrl: 'https://leetcode.com/problems/same-tree/' },
  { leetcodeNumber: 572,  title: 'Subtree of Another Tree',             difficulty: 'easy',   category: 'Trees',               pattern: 'DFS',               leetcodeUrl: 'https://leetcode.com/problems/subtree-of-another-tree/' },
  { leetcodeNumber: 543,  title: 'Diameter of Binary Tree',             difficulty: 'easy',   category: 'Trees',               pattern: 'DFS',               leetcodeUrl: 'https://leetcode.com/problems/diameter-of-binary-tree/' },
  { leetcodeNumber: 110,  title: 'Balanced Binary Tree',                difficulty: 'easy',   category: 'Trees',               pattern: 'DFS',               leetcodeUrl: 'https://leetcode.com/problems/balanced-binary-tree/' },
  { leetcodeNumber: 235,  title: 'Lowest Common Ancestor of BST',       difficulty: 'medium', category: 'Trees',               pattern: 'BST',               leetcodeUrl: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/' },
  { leetcodeNumber: 102,  title: 'Binary Tree Level Order Traversal',   difficulty: 'medium', category: 'Trees',               pattern: 'BFS',               leetcodeUrl: 'https://leetcode.com/problems/binary-tree-level-order-traversal/' },
  { leetcodeNumber: 199,  title: 'Binary Tree Right Side View',         difficulty: 'medium', category: 'Trees',               pattern: 'BFS',               leetcodeUrl: 'https://leetcode.com/problems/binary-tree-right-side-view/' },
  { leetcodeNumber: 230,  title: 'Kth Smallest Element in a BST',       difficulty: 'medium', category: 'Trees',               pattern: 'Inorder',           leetcodeUrl: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/' },
  { leetcodeNumber: 98,   title: 'Validate Binary Search Tree',         difficulty: 'medium', category: 'Trees',               pattern: 'DFS',               leetcodeUrl: 'https://leetcode.com/problems/validate-binary-search-tree/' },
  { leetcodeNumber: 105,  title: 'Construct Binary Tree from Preorder and Inorder Traversal', difficulty: 'medium', category: 'Trees', pattern: 'DFS', leetcodeUrl: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/' },
  { leetcodeNumber: 124,  title: 'Binary Tree Maximum Path Sum',        difficulty: 'hard',   category: 'Trees',               pattern: 'DFS',               leetcodeUrl: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/' },
  { leetcodeNumber: 297,  title: 'Serialize and Deserialize Binary Tree', difficulty: 'hard', category: 'Trees',               pattern: 'BFS/DFS',           leetcodeUrl: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/' },

  // ── Tries ───────────────────────────────────────────────
  { leetcodeNumber: 208,  title: 'Implement Trie',                      difficulty: 'medium', category: 'Tries',               pattern: 'Trie',              leetcodeUrl: 'https://leetcode.com/problems/implement-trie-prefix-tree/' },
  { leetcodeNumber: 211,  title: 'Design Add and Search Words Data Structure', difficulty: 'medium', category: 'Tries',        pattern: 'Trie + DFS',        leetcodeUrl: 'https://leetcode.com/problems/design-add-and-search-words-data-structure/' },
  { leetcodeNumber: 212,  title: 'Word Search II',                      difficulty: 'hard',   category: 'Tries',               pattern: 'Trie + Backtracking', leetcodeUrl: 'https://leetcode.com/problems/word-search-ii/' },

  // ── Heap / Priority Queue ──────────────────────────────
  { leetcodeNumber: 703,  title: 'Kth Largest Element in a Stream',     difficulty: 'easy',   category: 'Heap',                pattern: 'Min Heap',          leetcodeUrl: 'https://leetcode.com/problems/kth-largest-element-in-a-stream/' },
  { leetcodeNumber: 1046, title: 'Last Stone Weight',                   difficulty: 'easy',   category: 'Heap',                pattern: 'Max Heap',          leetcodeUrl: 'https://leetcode.com/problems/last-stone-weight/' },
  { leetcodeNumber: 215,  title: 'Kth Largest Element in an Array',     difficulty: 'medium', category: 'Heap',                pattern: 'Quick Select',      leetcodeUrl: 'https://leetcode.com/problems/kth-largest-element-in-an-array/' },
  { leetcodeNumber: 621,  title: 'Task Scheduler',                      difficulty: 'medium', category: 'Heap',                pattern: 'Greedy + Heap',     leetcodeUrl: 'https://leetcode.com/problems/task-scheduler/' },
  { leetcodeNumber: 355,  title: 'Design Twitter',                      difficulty: 'medium', category: 'Heap',                pattern: 'Heap + Hash Map',   leetcodeUrl: 'https://leetcode.com/problems/design-twitter/' },
  { leetcodeNumber: 295,  title: 'Find Median from Data Stream',        difficulty: 'hard',   category: 'Heap',                pattern: 'Two Heaps',         leetcodeUrl: 'https://leetcode.com/problems/find-median-from-data-stream/' },

  // ── Backtracking ────────────────────────────────────────
  { leetcodeNumber: 78,   title: 'Subsets',                             difficulty: 'medium', category: 'Backtracking',        pattern: 'Backtracking',      leetcodeUrl: 'https://leetcode.com/problems/subsets/' },
  { leetcodeNumber: 39,   title: 'Combination Sum',                     difficulty: 'medium', category: 'Backtracking',        pattern: 'Backtracking',      leetcodeUrl: 'https://leetcode.com/problems/combination-sum/' },
  { leetcodeNumber: 46,   title: 'Permutations',                        difficulty: 'medium', category: 'Backtracking',        pattern: 'Backtracking',      leetcodeUrl: 'https://leetcode.com/problems/permutations/' },
  { leetcodeNumber: 90,   title: 'Subsets II',                          difficulty: 'medium', category: 'Backtracking',        pattern: 'Backtracking',      leetcodeUrl: 'https://leetcode.com/problems/subsets-ii/' },
  { leetcodeNumber: 40,   title: 'Combination Sum II',                  difficulty: 'medium', category: 'Backtracking',        pattern: 'Backtracking',      leetcodeUrl: 'https://leetcode.com/problems/combination-sum-ii/' },
  { leetcodeNumber: 79,   title: 'Word Search',                         difficulty: 'medium', category: 'Backtracking',        pattern: 'Backtracking',      leetcodeUrl: 'https://leetcode.com/problems/word-search/' },
  { leetcodeNumber: 131,  title: 'Palindrome Partitioning',             difficulty: 'medium', category: 'Backtracking',        pattern: 'Backtracking',      leetcodeUrl: 'https://leetcode.com/problems/palindrome-partitioning/' },
  { leetcodeNumber: 17,   title: 'Letter Combinations of a Phone Number', difficulty: 'medium', category: 'Backtracking',      pattern: 'Backtracking',      leetcodeUrl: 'https://leetcode.com/problems/letter-combinations-of-a-phone-number/' },
  { leetcodeNumber: 51,   title: 'N-Queens',                            difficulty: 'hard',   category: 'Backtracking',        pattern: 'Backtracking',      leetcodeUrl: 'https://leetcode.com/problems/n-queens/' },

  // ── Graphs ──────────────────────────────────────────────
  { leetcodeNumber: 200,  title: 'Number of Islands',                   difficulty: 'medium', category: 'Graphs',              pattern: 'BFS/DFS',           leetcodeUrl: 'https://leetcode.com/problems/number-of-islands/' },
  { leetcodeNumber: 133,  title: 'Clone Graph',                         difficulty: 'medium', category: 'Graphs',              pattern: 'BFS/DFS',           leetcodeUrl: 'https://leetcode.com/problems/clone-graph/' },
  { leetcodeNumber: 695,  title: 'Max Area of Island',                  difficulty: 'medium', category: 'Graphs',              pattern: 'DFS',               leetcodeUrl: 'https://leetcode.com/problems/max-area-of-island/' },
  { leetcodeNumber: 417,  title: 'Pacific Atlantic Water Flow',         difficulty: 'medium', category: 'Graphs',              pattern: 'BFS/DFS',           leetcodeUrl: 'https://leetcode.com/problems/pacific-atlantic-water-flow/' },
  { leetcodeNumber: 130,  title: 'Surrounded Regions',                  difficulty: 'medium', category: 'Graphs',              pattern: 'BFS/DFS',           leetcodeUrl: 'https://leetcode.com/problems/surrounded-regions/' },
  { leetcodeNumber: 994,  title: 'Rotting Oranges',                     difficulty: 'medium', category: 'Graphs',              pattern: 'BFS',               leetcodeUrl: 'https://leetcode.com/problems/rotting-oranges/' },
  { leetcodeNumber: 207,  title: 'Course Schedule',                     difficulty: 'medium', category: 'Graphs',              pattern: 'Topological Sort',  leetcodeUrl: 'https://leetcode.com/problems/course-schedule/' },
  { leetcodeNumber: 210,  title: 'Course Schedule II',                  difficulty: 'medium', category: 'Graphs',              pattern: 'Topological Sort',  leetcodeUrl: 'https://leetcode.com/problems/course-schedule-ii/' },
  { leetcodeNumber: 684,  title: 'Redundant Connection',                difficulty: 'medium', category: 'Graphs',              pattern: 'Union Find',        leetcodeUrl: 'https://leetcode.com/problems/redundant-connection/' },
  { leetcodeNumber: 323,  title: 'Number of Connected Components',      difficulty: 'medium', category: 'Graphs',              pattern: 'Union Find',        leetcodeUrl: 'https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/' },
  { leetcodeNumber: 261,  title: 'Graph Valid Tree',                    difficulty: 'medium', category: 'Graphs',              pattern: 'Union Find',        leetcodeUrl: 'https://leetcode.com/problems/graph-valid-tree/' },
  { leetcodeNumber: 127,  title: 'Word Ladder',                         difficulty: 'hard',   category: 'Graphs',              pattern: 'BFS',               leetcodeUrl: 'https://leetcode.com/problems/word-ladder/' },

  // ── Dynamic Programming ─────────────────────────────────
  { leetcodeNumber: 70,   title: 'Climbing Stairs',                     difficulty: 'easy',   category: 'Dynamic Programming', pattern: 'DP',                leetcodeUrl: 'https://leetcode.com/problems/climbing-stairs/' },
  { leetcodeNumber: 746,  title: 'Min Cost Climbing Stairs',            difficulty: 'easy',   category: 'Dynamic Programming', pattern: 'DP',                leetcodeUrl: 'https://leetcode.com/problems/min-cost-climbing-stairs/' },
  { leetcodeNumber: 198,  title: 'House Robber',                        difficulty: 'medium', category: 'Dynamic Programming', pattern: 'DP',                leetcodeUrl: 'https://leetcode.com/problems/house-robber/' },
  { leetcodeNumber: 213,  title: 'House Robber II',                     difficulty: 'medium', category: 'Dynamic Programming', pattern: 'DP',                leetcodeUrl: 'https://leetcode.com/problems/house-robber-ii/' },
  { leetcodeNumber: 5,    title: 'Longest Palindromic Substring',       difficulty: 'medium', category: 'Dynamic Programming', pattern: 'DP',                leetcodeUrl: 'https://leetcode.com/problems/longest-palindromic-substring/' },
  { leetcodeNumber: 647,  title: 'Palindromic Substrings',              difficulty: 'medium', category: 'Dynamic Programming', pattern: 'DP',                leetcodeUrl: 'https://leetcode.com/problems/palindromic-substrings/' },
  { leetcodeNumber: 91,   title: 'Decode Ways',                         difficulty: 'medium', category: 'Dynamic Programming', pattern: 'DP',                leetcodeUrl: 'https://leetcode.com/problems/decode-ways/' },
  { leetcodeNumber: 322,  title: 'Coin Change',                         difficulty: 'medium', category: 'Dynamic Programming', pattern: 'DP',                leetcodeUrl: 'https://leetcode.com/problems/coin-change/' },
  { leetcodeNumber: 300,  title: 'Longest Increasing Subsequence',      difficulty: 'medium', category: 'Dynamic Programming', pattern: 'DP',                leetcodeUrl: 'https://leetcode.com/problems/longest-increasing-subsequence/' },
  { leetcodeNumber: 416,  title: 'Partition Equal Subset Sum',          difficulty: 'medium', category: 'Dynamic Programming', pattern: 'DP',                leetcodeUrl: 'https://leetcode.com/problems/partition-equal-subset-sum/' },
  { leetcodeNumber: 62,   title: 'Unique Paths',                        difficulty: 'medium', category: 'Dynamic Programming', pattern: 'DP',                leetcodeUrl: 'https://leetcode.com/problems/unique-paths/' },
  { leetcodeNumber: 1143, title: 'Longest Common Subsequence',          difficulty: 'medium', category: 'Dynamic Programming', pattern: 'DP',                leetcodeUrl: 'https://leetcode.com/problems/longest-common-subsequence/' },
  { leetcodeNumber: 309,  title: 'Best Time to Buy and Sell Stock with Cooldown', difficulty: 'medium', category: 'Dynamic Programming', pattern: 'DP', leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/' },
  { leetcodeNumber: 518,  title: 'Coin Change II',                      difficulty: 'medium', category: 'Dynamic Programming', pattern: 'DP',                leetcodeUrl: 'https://leetcode.com/problems/coin-change-ii/' },
  { leetcodeNumber: 494,  title: 'Target Sum',                          difficulty: 'medium', category: 'Dynamic Programming', pattern: 'DP',                leetcodeUrl: 'https://leetcode.com/problems/target-sum/' },
  { leetcodeNumber: 97,   title: 'Interleaving String',                 difficulty: 'medium', category: 'Dynamic Programming', pattern: 'DP',                leetcodeUrl: 'https://leetcode.com/problems/interleaving-string/' },
  { leetcodeNumber: 329,  title: 'Longest Increasing Path in a Matrix', difficulty: 'hard',   category: 'Dynamic Programming', pattern: 'DFS + Memoization', leetcodeUrl: 'https://leetcode.com/problems/longest-increasing-path-in-a-matrix/' },
  { leetcodeNumber: 115,  title: 'Distinct Subsequences',               difficulty: 'hard',   category: 'Dynamic Programming', pattern: 'DP',                leetcodeUrl: 'https://leetcode.com/problems/distinct-subsequences/' },
  { leetcodeNumber: 72,   title: 'Edit Distance',                       difficulty: 'medium', category: 'Dynamic Programming', pattern: 'DP',                leetcodeUrl: 'https://leetcode.com/problems/edit-distance/' },
  { leetcodeNumber: 312,  title: 'Burst Balloons',                      difficulty: 'hard',   category: 'Dynamic Programming', pattern: 'DP',                leetcodeUrl: 'https://leetcode.com/problems/burst-balloons/' },
  { leetcodeNumber: 10,   title: 'Regular Expression Matching',         difficulty: 'hard',   category: 'Dynamic Programming', pattern: 'DP',                leetcodeUrl: 'https://leetcode.com/problems/regular-expression-matching/' },

  // ── Greedy ──────────────────────────────────────────────
  { leetcodeNumber: 55,   title: 'Jump Game',                           difficulty: 'medium', category: 'Greedy',              pattern: 'Greedy',            leetcodeUrl: 'https://leetcode.com/problems/jump-game/' },
  { leetcodeNumber: 45,   title: 'Jump Game II',                        difficulty: 'medium', category: 'Greedy',              pattern: 'Greedy',            leetcodeUrl: 'https://leetcode.com/problems/jump-game-ii/' },
  { leetcodeNumber: 134,  title: 'Gas Station',                         difficulty: 'medium', category: 'Greedy',              pattern: 'Greedy',            leetcodeUrl: 'https://leetcode.com/problems/gas-station/' },
  { leetcodeNumber: 846,  title: 'Hand of Straights',                   difficulty: 'medium', category: 'Greedy',              pattern: 'Greedy',            leetcodeUrl: 'https://leetcode.com/problems/hand-of-straights/' },
  { leetcodeNumber: 1899, title: 'Merge Triplets to Form Target Triplet', difficulty: 'medium', category: 'Greedy',            pattern: 'Greedy',            leetcodeUrl: 'https://leetcode.com/problems/merge-triplets-to-form-target-triplet/' },
  { leetcodeNumber: 763,  title: 'Partition Labels',                    difficulty: 'medium', category: 'Greedy',              pattern: 'Greedy',            leetcodeUrl: 'https://leetcode.com/problems/partition-labels/' },
  { leetcodeNumber: 678,  title: 'Valid Parenthesis String',            difficulty: 'medium', category: 'Greedy',              pattern: 'Greedy',            leetcodeUrl: 'https://leetcode.com/problems/valid-parenthesis-string/' },

  // ── Intervals ───────────────────────────────────────────
  { leetcodeNumber: 57,   title: 'Insert Interval',                     difficulty: 'medium', category: 'Intervals',           pattern: 'Intervals',         leetcodeUrl: 'https://leetcode.com/problems/insert-interval/' },
  { leetcodeNumber: 56,   title: 'Merge Intervals',                     difficulty: 'medium', category: 'Intervals',           pattern: 'Intervals',         leetcodeUrl: 'https://leetcode.com/problems/merge-intervals/' },
  { leetcodeNumber: 435,  title: 'Non-overlapping Intervals',           difficulty: 'medium', category: 'Intervals',           pattern: 'Intervals',         leetcodeUrl: 'https://leetcode.com/problems/non-overlapping-intervals/' },
  { leetcodeNumber: 252,  title: 'Meeting Rooms',                       difficulty: 'easy',   category: 'Intervals',           pattern: 'Intervals',         leetcodeUrl: 'https://leetcode.com/problems/meeting-rooms/' },
  { leetcodeNumber: 253,  title: 'Meeting Rooms II',                    difficulty: 'medium', category: 'Intervals',           pattern: 'Intervals',         leetcodeUrl: 'https://leetcode.com/problems/meeting-rooms-ii/' },
  { leetcodeNumber: 1851, title: 'Minimum Interval to Include Each Query', difficulty: 'hard', category: 'Intervals',          pattern: 'Heap + Sort',       leetcodeUrl: 'https://leetcode.com/problems/minimum-interval-to-include-each-query/' },

  // ── Math & Geometry ─────────────────────────────────────
  { leetcodeNumber: 48,   title: 'Rotate Image',                        difficulty: 'medium', category: 'Math & Geometry',     pattern: 'Matrix',            leetcodeUrl: 'https://leetcode.com/problems/rotate-image/' },
  { leetcodeNumber: 54,   title: 'Spiral Matrix',                       difficulty: 'medium', category: 'Math & Geometry',     pattern: 'Matrix',            leetcodeUrl: 'https://leetcode.com/problems/spiral-matrix/' },
  { leetcodeNumber: 73,   title: 'Set Matrix Zeroes',                   difficulty: 'medium', category: 'Math & Geometry',     pattern: 'Matrix',            leetcodeUrl: 'https://leetcode.com/problems/set-matrix-zeroes/' },
  { leetcodeNumber: 202,  title: 'Happy Number',                        difficulty: 'easy',   category: 'Math & Geometry',     pattern: 'Fast & Slow',       leetcodeUrl: 'https://leetcode.com/problems/happy-number/' },
  { leetcodeNumber: 66,   title: 'Plus One',                            difficulty: 'easy',   category: 'Math & Geometry',     pattern: 'Math',              leetcodeUrl: 'https://leetcode.com/problems/plus-one/' },
  { leetcodeNumber: 50,   title: 'Pow(x, n)',                           difficulty: 'medium', category: 'Math & Geometry',     pattern: 'Math',              leetcodeUrl: 'https://leetcode.com/problems/powx-n/' },
  { leetcodeNumber: 43,   title: 'Multiply Strings',                    difficulty: 'medium', category: 'Math & Geometry',     pattern: 'Math',              leetcodeUrl: 'https://leetcode.com/problems/multiply-strings/' },
  { leetcodeNumber: 2013, title: 'Detect Squares',                      difficulty: 'medium', category: 'Math & Geometry',     pattern: 'Hash Map',          leetcodeUrl: 'https://leetcode.com/problems/detect-squares/' },

  // ── Bit Manipulation ───────────────────────────────────
  { leetcodeNumber: 136,  title: 'Single Number',                       difficulty: 'easy',   category: 'Bit Manipulation',    pattern: 'XOR',               leetcodeUrl: 'https://leetcode.com/problems/single-number/' },
  { leetcodeNumber: 191,  title: 'Number of 1 Bits',                    difficulty: 'easy',   category: 'Bit Manipulation',    pattern: 'Bit Manipulation',  leetcodeUrl: 'https://leetcode.com/problems/number-of-1-bits/' },
  { leetcodeNumber: 338,  title: 'Counting Bits',                       difficulty: 'easy',   category: 'Bit Manipulation',    pattern: 'DP + Bit',          leetcodeUrl: 'https://leetcode.com/problems/counting-bits/' },
  { leetcodeNumber: 190,  title: 'Reverse Bits',                        difficulty: 'easy',   category: 'Bit Manipulation',    pattern: 'Bit Manipulation',  leetcodeUrl: 'https://leetcode.com/problems/reverse-bits/' },
  { leetcodeNumber: 268,  title: 'Missing Number',                      difficulty: 'easy',   category: 'Bit Manipulation',    pattern: 'XOR',               leetcodeUrl: 'https://leetcode.com/problems/missing-number/' },
  { leetcodeNumber: 371,  title: 'Sum of Two Integers',                 difficulty: 'medium', category: 'Bit Manipulation',    pattern: 'Bit Manipulation',  leetcodeUrl: 'https://leetcode.com/problems/sum-of-two-integers/' },
  { leetcodeNumber: 7,    title: 'Reverse Integer',                     difficulty: 'medium', category: 'Bit Manipulation',    pattern: 'Math',              leetcodeUrl: 'https://leetcode.com/problems/reverse-integer/' },

  // ── 1-D DP (additional) ────────────────────────────────
  { leetcodeNumber: 139,  title: 'Word Break',                          difficulty: 'medium', category: 'Dynamic Programming', pattern: 'DP',                leetcodeUrl: 'https://leetcode.com/problems/word-break/' },
  { leetcodeNumber: 152,  title: 'Maximum Product Subarray',            difficulty: 'medium', category: 'Dynamic Programming', pattern: 'DP',                leetcodeUrl: 'https://leetcode.com/problems/maximum-product-subarray/' },
];

// Deduplicate by leetcodeNumber
const seen = new Set();
const uniqueProblems = problems.filter((p) => {
  if (seen.has(p.leetcodeNumber)) return false;
  seen.add(p.leetcodeNumber);
  return true;
});

async function main() {
  console.log('Seeding problems...');
  for (const problem of uniqueProblems) {
    await prisma.problem.upsert({
      where: { id: problem.leetcodeNumber },
      update: problem,
      create: problem,
    });
  }
  console.log(`Seeded ${uniqueProblems.length} problems.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
