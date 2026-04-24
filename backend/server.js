const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const edgePattern = /^[A-Z]->[A-Z]$/;

app.use(cors());
app.use(express.json());

function findConnectedComponents(nodesInOrder, acceptedEdges) {
  const undirected = new Map();

  for (const node of nodesInOrder) {
    undirected.set(node, new Set());
  }

  for (const [parent, child] of acceptedEdges) {
    undirected.get(parent).add(child);
    undirected.get(child).add(parent);
  }

  const visited = new Set();
  const components = [];

  for (const startNode of nodesInOrder) {
    if (visited.has(startNode)) {
      continue;
    }

    const stack = [startNode];
    const component = new Set();
    visited.add(startNode);

    while (stack.length > 0) {
      const node = stack.pop();
      component.add(node);

      for (const neighbor of undirected.get(node) || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          stack.push(neighbor);
        }
      }
    }

    components.push(component);
  }

  return components;
}

function componentHasCycle(component, childrenMap) {
  const color = new Map();

  const dfs = (node) => {
    color.set(node, 1);

    for (const child of childrenMap.get(node) || []) {
      if (!component.has(child)) {
        continue;
      }

      const state = color.get(child) || 0;

      if (state === 1) {
        return true;
      }

      if (state === 0 && dfs(child)) {
        return true;
      }
    }

    color.set(node, 2);
    return false;
  };

  for (const node of component) {
    if ((color.get(node) || 0) === 0 && dfs(node)) {
      return true;
    }
  }

  return false;
}

function selectRoot(component, childToParent) {
  const possibleRoots = [...component].filter((node) => !childToParent.has(node));

  if (possibleRoots.length > 0) {
    return possibleRoots[0];
  }

  return [...component].sort()[0];
}

function buildTreeObject(root, childrenMap) {
  const build = (node) => {
    const branch = {};

    for (const child of childrenMap.get(node) || []) {
      branch[child] = build(child);
    }

    return branch;
  };

  return { [root]: build(root) };
}

function computeDepth(root, childrenMap) {
  const children = childrenMap.get(root) || [];

  if (children.length === 0) {
    return 1;
  }

  let maxChildDepth = 0;

  for (const child of children) {
    maxChildDepth = Math.max(maxChildDepth, computeDepth(child, childrenMap));
  }

  return 1 + maxChildDepth;
}

function addNodeOnce(nodes, nodesInOrder, node) {
  if (!nodes.has(node)) {
    nodes.add(node);
    nodesInOrder.push(node);
  }
}

function solveHierarchy(data) {
  const invalidEntries = [];
  const duplicateEdges = [];

  const seenValidEdges = new Set();
  const duplicateEdgeSet = new Set();

  const acceptedEdges = [];
  const childToParent = new Map();
  const childrenMap = new Map();
  const nodes = new Set();
  const nodesInOrder = [];

  for (const raw of data) {
    const normalized = typeof raw === "string" ? raw.trim() : String(raw ?? "").trim();

    if (!edgePattern.test(normalized)) {
      invalidEntries.push(normalized);
      continue;
    }

    const [parent, child] = normalized.split("->");

    if (parent === child) {
      invalidEntries.push(normalized);
      continue;
    }

    if (seenValidEdges.has(normalized)) {
      if (!duplicateEdgeSet.has(normalized)) {
        duplicateEdgeSet.add(normalized);
        duplicateEdges.push(normalized);
      }
      continue;
    }

    seenValidEdges.add(normalized);

    if (childToParent.has(child)) {
      continue;
    }

    childToParent.set(child, parent);

    if (!childrenMap.has(parent)) {
      childrenMap.set(parent, []);
    }

    childrenMap.get(parent).push(child);
    acceptedEdges.push([parent, child]);

    addNodeOnce(nodes, nodesInOrder, parent);
    addNodeOnce(nodes, nodesInOrder, child);
  }

  const hierarchies = [];
  let totalTrees = 0;
  let totalCycles = 0;
  let largestTreeRoot = "";
  let largestTreeDepth = 0;

  if (nodesInOrder.length > 0) {
    const components = findConnectedComponents(nodesInOrder, acceptedEdges);

    for (const component of components) {
      const root = selectRoot(component, childToParent);
      const hasCycle = componentHasCycle(component, childrenMap);

      if (hasCycle) {
        hierarchies.push({
          root,
          tree: {},
          has_cycle: true
        });

        totalCycles += 1;
        continue;
      }

      const depth = computeDepth(root, childrenMap);

      hierarchies.push({
        root,
        tree: buildTreeObject(root, childrenMap),
        depth
      });

      totalTrees += 1;

      if (
        depth > largestTreeDepth ||
        (depth === largestTreeDepth && (largestTreeRoot === "" || root < largestTreeRoot))
      ) {
        largestTreeDepth = depth;
        largestTreeRoot = root;
      }
    }
  }

  return {
    user_id: process.env.USER_ID || "",
    email_id: process.env.EMAIL_ID || "",
    college_roll_number: process.env.COLLEGE_ROLL_NUMBER || "",
    hierarchies,
    invalid_entries: invalidEntries,
    duplicate_edges: duplicateEdges,
    summary: {
      total_trees: totalTrees,
      total_cycles: totalCycles,
      largest_tree_root: largestTreeRoot
    }
  };
}

app.post("/bfhl", (req, res) => {
  const { data } = req.body || {};

  if (!Array.isArray(data)) {
    return res.status(400).json({
      error: "Invalid payload. Expected { \"data\": [] }."
    });
  }

  return res.status(200).json(solveHierarchy(data));
});

const port = Number(process.env.PORT) || 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
