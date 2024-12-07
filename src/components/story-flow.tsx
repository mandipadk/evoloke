"use client";

import { useCallback, useEffect, useState, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  MiniMap,
  Panel,
  ReactFlowInstance,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { Story, Scene } from '@/types/story';
import { Eye, EyeOff, ZoomIn, ZoomOut, MapIcon, MapPinOff, Maximize2, Minimize2, MapPin } from 'lucide-react';

interface StoryFlowProps {
  story: Story;
  selectedSceneId: string | null;
  onSceneSelect: (sceneId: string) => void;
}

interface QueueItem {
  id: string;
  level: number;
}

const nodeWidth = 200;

function createNodesAndEdges(story: Story, selectedSceneId: string | null) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const visited = new Set<string>();
  const positions = new Map<string, { x: number; y: number }>();

  // Helper function to calculate node positions using a tree layout
  function calculatePosition(sceneId: string, level: number, index: number, totalInLevel: number) {
    const x = level * 300;
    const y = (index - (totalInLevel - 1) / 2) * 150;
    positions.set(sceneId, { x, y });
    return { x, y };
  }

  // First pass: calculate positions using BFS
  const queue: QueueItem[] = [{ id: story.config.startScene, level: 0 }];
  const levelCounts = new Map<number, number>();
  const levelNodes = new Map<number, string[]>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current.id)) continue;
    visited.add(current.id);

    // Count nodes in each level
    levelCounts.set(current.level, (levelCounts.get(current.level) || 0) + 1);
    if (!levelNodes.has(current.level)) levelNodes.set(current.level, []);
    levelNodes.get(current.level)!.push(current.id);

    const scene = story.scenes[current.id];
    if (!scene) continue;

    // Add children to queue
    scene.choices?.forEach(choice => {
      if (choice.nextScene && choice.nextScene !== 'end') {
        queue.push({ id: choice.nextScene, level: current.level + 1 });
      }
    });
  }

  // Second pass: create nodes and edges
  visited.clear();
  const nodeQueue: string[] = [story.config.startScene];

  while (nodeQueue.length > 0) {
    const sceneId = nodeQueue.shift()!;
    if (visited.has(sceneId)) continue;
    visited.add(sceneId);

    const scene = story.scenes[sceneId];
    if (!scene) continue;

    // Find level and index for this node
    let level = 0;
    let index = 0;
    for (const [l, nodes] of levelNodes.entries()) {
      const idx = nodes.indexOf(sceneId);
      if (idx !== -1) {
        level = l;
        index = idx;
        break;
      }
    }

    const { x, y } = calculatePosition(
      sceneId,
      level,
      index,
      levelNodes.get(level)?.length || 1
    );

    // Create node
    nodes.push({
      id: sceneId,
      position: { x, y },
      data: { label: scene.content.slice(0, 50) + '...' },
      style: {
        width: nodeWidth,
        background: selectedSceneId === sceneId ? '#f0f0f0' : '#ffffff',
        border: selectedSceneId === sceneId ? '2px solid #000' : '1px solid #ccc',
        borderRadius: '8px',
        padding: '10px',
      },
    });

    // Create edges for each choice
    scene.choices?.forEach((choice, index) => {
      if (choice.nextScene) {
        edges.push({
          id: `${sceneId}-${choice.nextScene}-${index}`,
          source: sceneId,
          target: choice.nextScene,
          label: choice.text,
          labelStyle: { fontSize: 12 },
          type: 'smoothstep',
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
          style: { stroke: '#999' },
        });

        if (!visited.has(choice.nextScene) && choice.nextScene !== 'end') {
          nodeQueue.push(choice.nextScene);
        }
      }
    });
  }

  // Add end node if there are any edges to it
  const hasEndEdges = edges.some(edge => edge.target === 'end');
  if (hasEndEdges) {
    const maxLevel = Math.max(...Array.from(levelCounts.keys()));
    nodes.push({
      id: 'end',
      position: { x: (maxLevel + 1) * 300, y: 0 },
      data: { label: 'END' },
      style: {
        width: nodeWidth,
        background: '#f8f8f8',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '10px',
      },
    });
  }

  return { nodes, edges };
}

export default function StoryFlow({ story, selectedSceneId, onSceneSelect }: StoryFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showMinimap, setShowMinimap] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const flowRef = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  useEffect(() => {
    const { nodes, edges } = createNodesAndEdges(story, selectedSceneId);
    setNodes(nodes);
    setEdges(edges);
  }, [story, selectedSceneId, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (node.id !== 'end') {
        onSceneSelect(node.id);
      }
    },
    [onSceneSelect]
  );

  const handleZoom = useCallback((scale: number) => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomTo(reactFlowInstance.getZoom() * scale);
    }
  }, [reactFlowInstance]);

  const handleCenterView = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
    }
  }, [reactFlowInstance]);

  const handleToggleHeight = useCallback(() => {
    if (flowRef.current) {
      setIsExpanded(prev => !prev);
      const newHeight = isExpanded ? 600 : 800;
      flowRef.current.style.height = `${newHeight}px`;
    }
  }, [isExpanded]);

  const minimapStyle = {
    height: 120,
    backgroundColor: 'rgb(23, 23, 23)',
    maskColor: '#00000060',
  };

  return (
    <div 
      ref={flowRef} 
      className="w-full h-[600px] bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 transition-all duration-300"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onInit={setReactFlowInstance}
        fitView
        proOptions={{ hideAttribution: true }}
        minZoom={0.1}
        maxZoom={4}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#666' },
        }}
      >
        <Background 
          color="#666" 
          gap={16} 
          className="dark:bg-neutral-900"
        />
        {showMinimap && (
          <MiniMap
            style={minimapStyle}
            zoomable
            pannable
            nodeColor={(node) => {
              if (node.id === selectedSceneId) return '#000000';
              if (node.id === 'end') return '#666666';
              return '#999999';
            }}
            maskColor="#00000060"
            className="dark:bg-neutral-800"
          />
        )}
        <Panel position="top-right" className="flex gap-2">
          <button
            onClick={() => setShowMinimap(prev => !prev)}
            className="p-2 rounded-lg bg-white dark:bg-neutral-800 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white border border-neutral-200 dark:border-neutral-700 transition-colors"
            title={showMinimap ? "Hide minimap" : "Show minimap"}
          >
            {showMinimap ? <MapPinOff className="w-4 h-4" /> : <MapIcon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => handleZoom(1.2)}
            className="p-2 rounded-lg bg-white dark:bg-neutral-800 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white border border-neutral-200 dark:border-neutral-700 transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(0.8)}
            className="p-2 rounded-lg bg-white dark:bg-neutral-800 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white border border-neutral-200 dark:border-neutral-700 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleCenterView}
            className="p-2 rounded-lg bg-white dark:bg-neutral-800 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white border border-neutral-200 dark:border-neutral-700 transition-colors"
            title="Center view"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={handleToggleHeight}
            className="p-2 rounded-lg bg-white dark:bg-neutral-800 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white border border-neutral-200 dark:border-neutral-700 transition-colors"
            title={isExpanded ? "Reduce height" : "Expand height"}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
} 