import { useCallback, useLayoutEffect, useState } from 'react';
import dagre from 'dagre';
import { Node, Edge } from '@xyflow/react';

const useAutoLayout = (initialNodes: Node[], initialEdges: Edge[]) => {
  const [layoutedNodes, setLayoutedNodes] = useState<Node[]>(initialNodes);
  const [layoutedEdges, setLayoutedEdges] = useState<Edge[]>(initialEdges);

  const getLayoutedElements = useCallback(
    (nodes: Node[], edges: Edge[], direction = 'TB') => {
      const dagreGraph = new dagre.graphlib.Graph();
      dagreGraph.setDefaultEdgeLabel(() => ({}));
      dagreGraph.setGraph({ rankdir: direction });

      nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: 150, height: 50 });
      });

      edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
      });

      dagre.layout(dagreGraph);

      const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
          ...node,
          position: {
            x: nodeWithPosition.x - 75,
            y: nodeWithPosition.y - 25,
          },
          draggable: true,
        };
      });

      return { layoutedNodes, layoutedEdges: edges };
    },
    []
  );

  useLayoutEffect(() => {
    const { layoutedNodes: newNodes, layoutedEdges: newEdges } = getLayoutedElements(
      initialNodes,
      initialEdges
    );
    setLayoutedNodes(newNodes);
    setLayoutedEdges(newEdges);
  }, [initialNodes, initialEdges, getLayoutedElements]);

  return { layoutedNodes, layoutedEdges };
};

export default useAutoLayout;