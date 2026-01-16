import { useState, useEffect } from 'react';
import { Graph, GraphNode } from '@/lib/pathfinding';

/**
 * Hook to load and manage graph data
 */
export function useGraph() {
  const [graph, setGraph] = useState<Graph | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGraph() {
      try {
        const response = await fetch('/graph.json');
        if (!response.ok) {
          throw new Error('Failed to load graph data');
        }
        const data: Graph = await response.json();
        setGraph(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }

    loadGraph();
  }, []);

  // Get only navigable locations (exclude junctions)
  const locations: GraphNode[] = graph?.nodes.filter(
    node => node.type !== 'junction'
  ) || [];

  // Group locations by type
  const locationsByType = locations.reduce((acc, node) => {
    if (!acc[node.type]) {
      acc[node.type] = [];
    }
    acc[node.type].push(node);
    return acc;
  }, {} as Record<string, GraphNode[]>);

  return {
    graph,
    locations,
    locationsByType,
    loading,
    error
  };
}
