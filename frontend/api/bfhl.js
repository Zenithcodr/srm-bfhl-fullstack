function processHierarchy(data) {
  const invalid_entries = [];
  const duplicate_edges = [];
  const seenEdges = new Set();
  const duplicateSet = new Set();
  const nodes = new Set();
  const nodeOrder = [];
  const parentOf = new Map();
  const childrenMap = new Map();
  const acceptedEdges = [];

  function addNode(node) {
    if (!nodes.has(node)) {
      nodes.add(node);
      nodeOrder.push(node);
    }
  }

  function addChild(parent, child) {
    if (!childrenMap.has(parent)) childrenMap.set(parent, []);
    childrenMap.get(parent).push(child);
  }

  for (const item of data) {
    const entry = String(item ?? "").trim();

    if (!/^[A-Z]->[A-Z]$/.test(entry)) {
      invalid_entries.push(entry);
      continue;
    }

    const [parent, child] = entry.split("->");

    if (parent === child) {
      invalid_entries.push(entry);
      continue;
    }

    if (seenEdges.has(entry)) {
      if (!duplicateSet.has(entry)) {
        duplicate_edges.push(entry);
        duplicateSet.add(entry);
      }
      continue;
    }

    seenEdges.add(entry);

    if (parentOf.has(child) && parentOf.get(child) !== parent) {
      continue;
    }

    parentOf.set(child, parent);
    addNode(parent);
    addNode(child);
    acceptedEdges.push([parent, child]);
    addChild(parent, child);
  }

  const directed = new Map();
  const undirected = new Map();

  for (const node of nodes) {
    directed.set(node, []);
    undirected.set(node, []);
  }

  for (const [parent, child] of acceptedEdges) {
    directed.get(parent).push(child);
    undirected.get(parent).push(child);
    undirected.get(child).push(parent);
  }

  function getComponents() {
    const visited = new Set();
    const components = [];

    for (const start of nodeOrder) {
      if (visited.has(start)) continue;

      const queue = [start];
      const component = [];
      visited.add(start);

      while (queue.length) {
        const current = queue.shift();
        component.push(current);

        for (const neighbor of undirected.get(current) || []) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }

      components.push(component);
    }

    return components;
  }

  function hasCycle(componentNodes) {
    const componentSet = new Set(componentNodes);
    const state = new Map();

    function dfs(node) {
      state.set(node, 1);

      for (const child of directed.get(node) || []) {
        if (!componentSet.has(child)) continue;

        const childState = state.get(child) || 0;

        if (childState === 1) return true;
        if (childState === 0 && dfs(child)) return true;
      }

      state.set(node, 2);
      return false;
    }

    for (const node of componentNodes) {
      if (!state.has(node) && dfs(node)) return true;
    }

    return false;
  }

  function buildTree(node, componentSet) {
    const result = {};
    const children = directed.get(node) || [];

    for (const child of children) {
      if (componentSet.has(child)) {
        result[child] = buildTree(child, componentSet);
      }
    }

    return result;
  }

  function calculateDepth(node, componentSet) {
    const children = (directed.get(node) || []).filter((child) =>
      componentSet.has(child)
    );

    if (children.length === 0) return 1;

    return 1 + Math.max(...children.map((child) => calculateDepth(child, componentSet)));
  }

  const hierarchies = [];
  const components = getComponents();

  let total_trees = 0;
  let total_cycles = 0;
  let largest_tree_root = "";
  let largestDepth = 0;

  for (const component of components) {
    const componentSet = new Set(component);

    const roots = component.filter((node) => !parentOf.has(node)).sort();
    const cyclePresent = hasCycle(component);

    const root = roots.length > 0 ? roots[0] : [...component].sort()[0];

    if (cyclePresent) {
      hierarchies.push({
        root,
        tree: {},
        has_cycle: true
      });
      total_cycles++;
    } else {
      const tree = {};
      tree[root] = buildTree(root, componentSet);

      const depth = calculateDepth(root, componentSet);

      hierarchies.push({
        root,
        tree,
        depth
      });

      total_trees++;

      if (
        depth > largestDepth ||
        (depth === largestDepth && (largest_tree_root === "" || root < largest_tree_root))
      ) {
        largestDepth = depth;
        largest_tree_root = root;
      }
    }
  }

  return {
    hierarchies,
    invalid_entries,
    duplicate_edges,
    summary: {
      total_trees,
      total_cycles,
      largest_tree_root
    }
  };
}

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed. Use POST /bfhl."
    });
  }

  const { data } = req.body || {};

  if (!Array.isArray(data)) {
    return res.status(400).json({
      error: "Invalid request. Body must contain a data array."
    });
  }

  const processed = processHierarchy(data);

  return res.status(200).json({
    user_id: process.env.USER_ID || "fullname_ddmmyyyy",
    email_id: process.env.EMAIL_ID || "college_email",
    college_roll_number: process.env.COLLEGE_ROLL_NUMBER || "college_roll_number",
    ...processed
  });
}