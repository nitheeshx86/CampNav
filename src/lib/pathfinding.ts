// Dijkstra's Algorithm Implementation for Campus Navigation
// Runs entirely in the browser - no backend required

export interface GraphNode {
  id: string;
  name: string;
  x: number;
  y: number;
  type: 'building' | 'academic' | 'food' | 'sports' | 'service' | 'landmark' | 'junction' | 'auditorium';
  floor?: string;
  facts?: string[];
  blockId?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight: number;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface PathResult {
  path: string[];
  coordinates: { x: number; y: number }[];
}

/**
 * Build adjacency list from graph edges
 */
function buildAdjacencyList(edges: GraphEdge[]): Map<string, { node: string; weight: number }[]> {
  const adjacency = new Map<string, { node: string; weight: number }[]>();

  for (const edge of edges) {
    // Add forward edge
    if (!adjacency.has(edge.from)) {
      adjacency.set(edge.from, []);
    }
    adjacency.get(edge.from)!.push({ node: edge.to, weight: edge.weight });

    // Add reverse edge (bidirectional paths)
    if (!adjacency.has(edge.to)) {
      adjacency.set(edge.to, []);
    }
    adjacency.get(edge.to)!.push({ node: edge.from, weight: edge.weight });
  }

  return adjacency;
}

/**
 * Dijkstra's Algorithm - finds shortest path between two nodes
 * Time Complexity: O((V + E) log V) with priority queue
 */
export function findShortestPath(
  graph: Graph,
  startId: string,
  endId: string
): PathResult | null {
  const { nodes, edges } = graph;

  // Validate nodes exist
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  if (!nodeMap.has(startId) || !nodeMap.has(endId)) {
    console.error('Invalid start or end node');
    return null;
  }

  // Build adjacency list
  const adjacency = buildAdjacencyList(edges);

  // Initialize distances and previous nodes
  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const visited = new Set<string>();

  // Priority queue implemented as array (sorted by distance)
  // For production, consider using a proper min-heap
  const queue: { node: string; distance: number }[] = [];

  // Initialize all distances to infinity
  for (const node of nodes) {
    distances.set(node.id, Infinity);
    previous.set(node.id, null);
  }

  // Start node has distance 0
  distances.set(startId, 0);
  queue.push({ node: startId, distance: 0 });

  // Main Dijkstra loop
  while (queue.length > 0) {
    // Sort and get minimum distance node
    queue.sort((a, b) => a.distance - b.distance);
    const current = queue.shift()!;

    // Skip if already visited
    if (visited.has(current.node)) continue;
    visited.add(current.node);

    // Found destination
    if (current.node === endId) break;

    // Get neighbors
    const neighbors = adjacency.get(current.node) || [];

    for (const neighbor of neighbors) {
      if (visited.has(neighbor.node)) continue;

      const newDistance = distances.get(current.node)! + neighbor.weight;

      if (newDistance < distances.get(neighbor.node)!) {
        distances.set(neighbor.node, newDistance);
        previous.set(neighbor.node, current.node);
        queue.push({ node: neighbor.node, distance: newDistance });
      }
    }
  }

  // Reconstruct path
  const path: string[] = [];
  let currentNode: string | null = endId;

  while (currentNode !== null) {
    path.unshift(currentNode);
    currentNode = previous.get(currentNode) ?? null;
  }

  // Check if path was found
  if (path[0] !== startId) {
    console.error('No path found between nodes');
    return null;
  }

  // Get coordinates for path visualization
  const coordinates = path.map(nodeId => {
    const node = nodeMap.get(nodeId)!;
    return { x: node.x, y: node.y };
  });

  return {
    path,
    coordinates
  };
}


/**
 * Get node type display info
 */
export function getNodeTypeInfo(type: GraphNode['type']): { label: string; color: string } {
  const typeMap: Record<GraphNode['type'], { label: string; color: string }> = {
    academic: { label: 'Academic', color: 'badge-academic' },
    building: { label: 'Building', color: 'badge-building' },
    food: { label: 'Food', color: 'badge-food' },
    sports: { label: 'Sports', color: 'badge-sports' },
    service: { label: 'Service', color: 'badge-service' },
    landmark: { label: 'Landmark', color: 'badge-landmark' },
    junction: { label: 'Junction', color: 'badge-building' },
    auditorium: { label: 'Auditorium', color: 'badge-building' }
  };
  return typeMap[type] || { label: 'Location', color: 'badge-building' };
}
