import React, { useState, useEffect, useCallback } from 'react';
import type { StoryNode } from './types';
import ReactFlow, { Background, Controls, MiniMap, Handle, useNodesState, useEdgesState, addEdge, Position, Viewport } from 'reactflow';
import 'reactflow/dist/style.css';

function StoryEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [storyData, setStoryData] = useState<StoryNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<StoryNode | null>(null);
  const [storyName, setStoryName] = useState<string>('cinderella'); // make it dynamic!

  useEffect(() => {
    fetch(`/story/${storyName}/story.json`)
      .then((response) => response.json())
      .then((data) => {
        setStoryData(data);
        // setCurrentNode(data[0]); // 첫 번째 노드로 초기화
      });
  }, [storyName]);

  useEffect(() => {
    const levelIndexMap = new Map<number, number>();
    const initialNodes = storyData.map((node) => {
      if (!levelIndexMap.has(node.level)) {
        levelIndexMap.set(node.level, 0);
      }
      const levelIndex = levelIndexMap.get(node.level) ?? 0;
      levelIndexMap.set(node.level, levelIndex + 1);

      const nodesInLevel = storyData.filter(
        (n) => n.level === node.level
      ).length;
      const yOffset = (nodesInLevel - 1) * 75; // Adjust the offset to center nodes vertically

      return {
        id: `${node.level}-${node.index}`,
        data: { label: node.text },
        position: { x: node.level * 800, y: levelIndex * 150 - yOffset },

        type: "default",
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };
    });

    const initialEdges = storyData.flatMap((node) =>
      node?.choices?.map((choice) => ({
        id: `${node.level}-${node.index}-${choice.nextNodeLevel}-${choice.nextNodeIndex}`,
        source: `${node.level}-${node.index}`,
        target: `${choice.nextNodeLevel}-${choice.nextNodeIndex}`,
        sourceHandle: 'right',
        targetHandle: 'left',
        type: "bidirectional",
        label: choice.text, // Add the choice text as the label for the edge

      }))
    );

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [storyData]);

  const handleNodeClick = (event, node) => {
    setSelectedNode(node);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setSelectedNode((prevNode) => ({
      ...prevNode,
      data: {
        ...prevNode.data,
        [name]: value,
      },
    }));
  };

  const handleSave = () => {
    const updatedData = nodes.map((node) => ({
      level: parseInt(node.id.split("-")[0]),
      index: parseInt(node.id.split("-")[1]),
      text: node.data.label,
      choices: storyData.find(
        (d) =>
          d.level === parseInt(node.id.split("-")[0]) &&
          d.index === parseInt(node.id.split("-")[1])
      ).choices,
    }));
    // onSave(updatedData);
  };

  const nodeTypes = {
    customNode: ({ data }) => (
      <div style={{ width: '400px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', background: '#fff' }}>
        <Handle type="target" position="left" id="left" style={{ background: '#555' }} />
        <div>{data.label}</div>
        <Handle type="source" position="right" id="right" style={{ background: '#555' }} />
      </div>
    ),
  };
  const defaultViewport: Viewport = { x: 40, y: 300, zoom: 1.3 };

  return (
    <div style={styles.container}>
      <div style={{ flex: 4, height: '100%' }}>
        <ReactFlow
          defaultViewport={defaultViewport}
          nodes={nodes.map(node => ({ ...node, type: 'customNode' }))}
          edges={edges}
          onNodeClick={handleNodeClick}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          style={{ fontSize: '20px' }}
        >
          <Background />
          <MiniMap />
          <Controls />
        </ReactFlow>
      </div>
      <div style={{ flex: 1, padding: '20px', borderLeft: '1px solid #ddd' }}>
        {selectedNode ? (
          <div>
            <h3>노드 정보 편집</h3>
            <label>텍스트:</label>
            <input
              type="text"
              name="label"
              value={selectedNode.data.label}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <button onClick={handleSave} style={{ padding: '8px', width: '100%' }}>
              저장
            </button>
          </div>
        ) : (
          <p>편집할 노드를 선택하세요</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    width: '95vw',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: '#fff',
    zIndex: -2,
  },
};

export default StoryEditor;
