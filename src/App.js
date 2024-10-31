// App.js
import React from 'react';
import './App.css';
import Notes from './components/Notes';
import { saveToFile, loadFromFile, exportAsPNG } from './utils/fileUtils';
import defaultNodes from './data/defaultNodes.json';
import defaultConnections from './data/defaultConnections.json';

function App() {
  // State Management
  const [nodes, setNodes] = React.useState(() => {
    try {
      return defaultNodes;
    } catch (error) {
      console.error('Error loading default nodes:', error);
      return [];
    }
  });

  const [edges, setEdges] = React.useState(() => {
    try {
      return defaultConnections;
    } catch (error) {
      console.error('Error loading default connections:', error);
      return [];
    }
  });

  const [expandedNodes, setExpandedNodes] = React.useState(new Set(['root']));
  const [hoveredNode, setHoveredNode] = React.useState(null);
  const [selectedNode, setSelectedNode] = React.useState(null);
  const [activeNoteId, setActiveNoteId] = React.useState(null);
  const [noteText, setNoteText] = React.useState('');
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
  const svgRef = React.useRef(null);

  const [newNodeForm, setNewNodeForm] = React.useState({
    label: '',
    type: 'default',
    parent: ''
  });

  // File Management Functions
  const handleSave = async () => {
    const data = {
      nodes,
      edges,
      expandedNodes: Array.from(expandedNodes)
    };
    const success = await saveToFile(data, 'mindmap-data.json');
    if (success) {
      alert('Mind map saved successfully!');
    } else {
      alert('Failed to save mind map');
    }
  };

  const handleLoad = async () => {
    const data = await loadFromFile();
    if (data) {
      setNodes(data.nodes);
      setEdges(data.edges);
      setExpandedNodes(new Set(data.expandedNodes));
      alert('Mind map loaded successfully!');
    }
  };

  const handleExportPNG = async () => {
    if (svgRef.current) {
      const success = await exportAsPNG(svgRef.current);
      if (success) {
        alert('Mind map exported as PNG successfully!');
      } else {
        alert('Failed to export mind map');
      }
    }
  };

  // Node Management Functions
  const getDirectChildren = (nodeId) => {
    return edges
      .filter(edge => edge.from === nodeId)
      .map(edge => edge.to);
  };

  const getAllDescendants = (nodeId, visited = new Set()) => {
    if (visited.has(nodeId)) return [];
    visited.add(nodeId);
    
    const children = getDirectChildren(nodeId);
    let descendants = [...children];
    
    children.forEach(childId => {
      descendants = [...descendants, ...getAllDescendants(childId, visited)];
    });
    
    return descendants;
  };

  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const addNode = () => {
    if (!newNodeForm.label) return;

    const parentNode = nodes.find(n => n.id === newNodeForm.parent);
    const newX = parentNode ? parentNode.x + 200 : 100;
    
    const siblingNodes = parentNode 
      ? edges.filter(e => e.from === newNodeForm.parent).map(e => e.to)
      : nodes.filter(n => n.x === newX);
    
    const newY = parentNode 
      ? parentNode.y + (siblingNodes.length * 50)
      : 100 + (siblingNodes.length * 50);

    const newNode = {
      id: newNodeForm.label.toLowerCase().replace(/\s+/g, '-'),
      label: newNodeForm.label,
      type: newNodeForm.type,
      x: newX,
      y: newY,
      notes: ''
    };

    setNodes(prev => [...prev, newNode]);

    if (newNodeForm.parent) {
      setEdges(prev => [...prev, { from: newNodeForm.parent, to: newNode.id }]);
      setExpandedNodes(prev => new Set([...prev, newNodeForm.parent]));
    }

    setNewNodeForm({ label: '', type: 'default', parent: '' });
  };

  const removeNode = (nodeId) => {
    const descendants = getAllDescendants(nodeId);
    setNodes(prev => prev.filter(n => n.id !== nodeId && !descendants.includes(n.id)));
    setEdges(prev => prev.filter(e => 
      e.from !== nodeId && 
      e.to !== nodeId && 
      !descendants.includes(e.from) && 
      !descendants.includes(e.to)
    ));
    setSelectedNode(null);
  };

  // Note Management
  const toggleNotePopup = (nodeId, e) => {
    e.stopPropagation();
    if (activeNoteId === nodeId) {
      setActiveNoteId(null);
      setNoteText('');
    } else {
      const node = nodes.find(n => n.id === nodeId);
      setActiveNoteId(nodeId);
      setNoteText(node.notes || '');
    }
  };

  const saveNote = (e) => {
    e.stopPropagation();
    setNodes(prev => prev.map(node => 
      node.id === activeNoteId 
        ? { ...node, notes: noteText }
        : node
    ));
    setActiveNoteId(null);
  };

    // Drag and Drop Functionality
    const handleNodeDragStart = (e, nodeId) => {
      const node = nodes.find(n => n.id === nodeId);
      const rect = e.target.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
      setSelectedNode(nodeId);
    };
  
    const handleNodeDrag = (e, nodeId) => {
      if (!isDragging || selectedNode !== nodeId) return;
  
      const svgRect = svgRef.current.getBoundingClientRect();
      const newX = e.clientX - svgRect.left - dragOffset.x;
      const newY = e.clientY - svgRect.top - dragOffset.y;
  
      setNodes(prev => prev.map(node => 
        node.id === nodeId
          ? { ...node, x: newX, y: newY }
          : node
      ));
    };
  
    const handleNodeDragEnd = () => {
      setIsDragging(false);
    };
  
    // Memoized Calculations
    const visibleNodes = React.useMemo(() => {
      const visibleNodeIds = new Set();
      
      nodes.filter(node => node.type === 'root').forEach(node => {
        visibleNodeIds.add(node.id);
      });
  
      Array.from(expandedNodes).forEach(nodeId => {
        const children = getDirectChildren(nodeId);
        children.forEach(childId => visibleNodeIds.add(childId));
        visibleNodeIds.add(nodeId);
      });
  
      return nodes.filter(node => visibleNodeIds.has(node.id));
    }, [nodes, expandedNodes, edges]);
  
    const visibleEdges = React.useMemo(() => {
      const visibleNodeIds = new Set(visibleNodes.map(node => node.id));
      return edges.filter(edge => 
        visibleNodeIds.has(edge.from) && visibleNodeIds.has(edge.to)
      );
    }, [visibleNodes, edges]);
  
    // Utility Functions
    const generateCurvedPath = (startX, startY, endX, endY) => {
      const controlPointX = (startX + endX) / 2;
      const controlPointY = (startY + endY) / 2;
      const curveOffset = 30;
      const dx = endX - startX;
      const dy = endY - startY;
      const angle = Math.atan2(dy, dx);
      const perpAngle = angle + Math.PI / 2;
      const controlX = controlPointX + curveOffset * Math.cos(perpAngle);
      const controlY = controlPointY + curveOffset * Math.sin(perpAngle);
      return `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
    };
  
    const getNodeColor = (type) => {
      switch (type) {
        case 'root':
          return '#4CAF50';
        case 'category':
          return '#2196F3';
        default:
          return '#f44336';
      }
    };
  
    const hasChildren = (nodeId) => {
      return edges.some(edge => edge.from === nodeId);
    };
  
    // Keyboard Shortcuts
    React.useEffect(() => {
      const handleKeyPress = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault();
          handleSave();
        }
      };
  
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }, [nodes, edges, expandedNodes]);
  
    return (
      <div className="flex h-screen bg-gray-900">
        {/* Control Panel */}
        <div className="w-64 bg-gray-800 text-gray-300 p-4 flex flex-col">
          <h2 className="text-xl mb-4">Mind Map Controls</h2>
          
          {/* File Operations */}
          <div className="mb-6 space-y-2">
            <button
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              onClick={handleSave}
            >
              Save Mind Map
            </button>
            <button
              className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
              onClick={handleLoad}
            >
              Load Mind Map
            </button>
            <button
              className="w-full bg-purple-500 text-white p-2 rounded hover:bg-purple-600"
              onClick={handleExportPNG}
            >
              Export as PNG
            </button>
          </div>
  
          {/* Node Creation Form */}
          <h3 className="text-lg mb-2">Add New Node</h3>
          <input
            type="text"
            placeholder="Node Label"
            className="bg-gray-700 text-white p-2 rounded mb-2"
            value={newNodeForm.label}
            onChange={(e) => setNewNodeForm({...newNodeForm, label: e.target.value})}
          />
          <select
            className="bg-gray-700 text-white p-2 rounded mb-2"
            value={newNodeForm.type}
            onChange={(e) => setNewNodeForm({...newNodeForm, type: e.target.value})}
          >
            <option value="default">Default</option>
            <option value="root">Root</option>
            <option value="category">Category</option>
          </select>
          <select
            className="bg-gray-700 text-white p-2 rounded mb-2"
            value={newNodeForm.parent}
            onChange={(e) => setNewNodeForm({...newNodeForm, parent: e.target.value})}
          >
            <option value="">No Parent</option>
            {nodes.map(node => (
              <option key={node.id} value={node.id}>{node.label}</option>
            ))}
          </select>
          <button
            className="bg-blue-500 text-white p-2 rounded mb-4 hover:bg-blue-600"
            onClick={addNode}
          >
            Add Node
          </button>
  
          {/* Selected Node Controls */}
          {selectedNode && (
            <div className="mt-4">
              <h3 className="text-lg mb-2">Selected Node</h3>
              <p className="mb-2">{nodes.find(n => n.id === selectedNode)?.label}</p>
              <button
                className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
                onClick={() => removeNode(selectedNode)}
              >
                Remove Node
              </button>
            </div>
          )}
        </div>
  
        {/* Graph View */}
        <div className="flex-1 relative overflow-hidden">
          <svg 
            ref={svgRef}
            width="100%" 
            height="100%" 
            className="bg-gray-900"
            onMouseUp={handleNodeDragEnd}
            onMouseLeave={handleNodeDragEnd}
          >
            {/* Edges */}
            {visibleEdges.map((edge, index) => {
              const fromNode = nodes.find(n => n.id === edge.from);
              const toNode = nodes.find(n => n.id === edge.to);
              return (
                <path
                  key={`edge-${index}`}
                  d={generateCurvedPath(fromNode.x, fromNode.y, toNode.x, toNode.y)}
                  stroke="#666"
                  strokeWidth="1"
                  fill="none"
                  className="transition-all duration-300"
                />
              );
            })}
            
            {/* Nodes */}
            {visibleNodes.map((node) => (
              <g 
                key={node.id}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onMouseDown={(e) => handleNodeDragStart(e, node.id)}
                onMouseMove={(e) => handleNodeDrag(e, node.id)}
                className="cursor-pointer"
              >
                {/* Node Circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={12}
                  fill={getNodeColor(node.type)}
                  className={`transition-all duration-200 ${
                    hoveredNode === node.id || selectedNode === node.id ? 'opacity-80' : 'opacity-100'
                  }`}
                />
  
                {/* Expand/Collapse Indicator */}
                {hasChildren(node.id) && (
                  <text
                    x={node.x - 4}
                    y={node.y + 4}
                    fill="white"
                    className="text-xs font-bold"
                  >
                    {expandedNodes.has(node.id) ? '-' : '+'}
                  </text>
                )}
  
                {/* Node Label */}
                <text
                  x={node.x + 20}
                  y={node.y + 5}
                  fill={hoveredNode === node.id || selectedNode === node.id ? '#fff' : '#90caf9'}
                  className="text-sm"
                >
                  {node.label}
                </text>
  
                {/* Note Icon */}
                <g
                  transform={`translate(${node.x - 30}, ${node.y - 10})`}
                  onClick={(e) => toggleNotePopup(node.id, e)}
                  className="cursor-pointer hover:opacity-80"
                >
                  <rect
                    width="20"
                    height="20"
                    fill="transparent"
                    stroke={node.notes ? "#ffd700" : "#666"}
                    rx="4"
                  />
                  <text
                    x="10"
                    y="15"
                    textAnchor="middle"
                    fill={node.notes ? "#ffd700" : "#666"}
                    className="text-xs"
                  >
                    📝
                  </text>
                </g>
  
                {/* Note Popup */}
                {activeNoteId === node.id && (
                  <Notes
                    setActiveNoteId={setActiveNoteId}
                    noteText={noteText}
                    setNoteText={setNoteText}
                    node={node}
                    saveNote={saveNote}
                  />
                )}
              </g>
            ))}
          </svg>
        </div>
      </div>
    );
  }
  
  export default App;