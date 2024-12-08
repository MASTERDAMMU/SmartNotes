// App.js
import React from 'react';
import './App.css';
import Notes from './components/Notes';
import { saveToFile, loadFromFile, exportAsPNG } from './utils/fileUtils';
import defaultNodes from './data/defaultNodes.json';
import defaultConnections from './data/defaultConnections.json';
import NoteSummary from './components/NoteSummary';
const TabMap = {}

function App() {



  const [tabs, setTabs] = React.useState([{ id: 'Mind Map', label: 'Mind Map' }]);
  const [activeTab, setActiveTab] = React.useState('Mind Map');
  const [tabCount, setTabCount] = React.useState(1);
  const defaultTab ={
    nodes : defaultNodes,
    edges : defaultConnections,
    expandedNodes: new Set(['root']),
    hoveredNode: null,
    selectedNode:null,
    activeNoteId:null,
    activeNoteSummaryId: null,
    noteText:'',
    isDragging:false,
    dragOffset:{ x: 0, y: 0 },
    svgRef: null
  }
  if (TabMap['Mind Map'] == undefined) {
    TabMap['Mind Map'] = {...defaultTab}
  }
  React.useEffect(()=>{
    setNodes(TabMap[activeTab].nodes)
    setEdges(TabMap[activeTab].edges)
    setHoveredNode(TabMap[activeTab].hoveredNode)
    setSelectedNode(TabMap[activeTab].selectedNode)
    setActiveNoteId(TabMap[activeTab].activeNoteId)
    setActiveNoteSummaryId(TabMap[activeTab].activeNoteSummaryId)
    setNoteText(TabMap[activeTab].noteText)
    setIsDragging(TabMap[activeTab].isDragging)
    setDragOffset(TabMap[activeTab].dragOffset)
    svgRef = TabMap[activeTab].svgRef

  },[activeTab])
  const addTab = () => {
      const newTabCount = tabCount + 1;
      // prompt for name

      const name = prompt("Name of Map")
      const newTab = { id: name, label: name };
      setTabs([...tabs, newTab]);
      setTabCount(newTabCount);
      setActiveTab(newTab.id); // Open the new tab
      TabMap[name] = {...defaultTab}

  };

  const CopyToNewTab = (selectedNode) => {
    if (selectedNode == 'root'){ 
      alert('Cannot copy root node');
      return;
    }
    const newTabCount = tabCount + 1;
    const name = prompt("Name of Map")
    const newTab = { id: name, label: name };
    const nod = TabMap[activeTab].nodes.find((n) => n.id === selectedNode);    
    let nods = []
    let edges = []

    nods = [ nod.id, ...getAllDescendants(nod.id)];
    edges = new Set(TabMap[activeTab].edges.filter((c) => nods.includes(c.from)));
    // convert edges set to arry
    let copiedEdges = Array.from(edges);

    nods = nods.map((n) => TabMap[activeTab].nodes.find((an) => an.id === n));

    TabMap[newTab.id] =  {
      nodes : [...nods, ...defaultNodes],
      edges : [...copiedEdges, { from: 'root', to: nod.id }],
      expandedNodes: new Set(['root']),
      hoveredNode: null,
      selectedNode:null,
      activeNoteId:null,
      activeNoteSummaryId: null,
      noteText:'',
      isDragging:false,
      dragOffset:{ x: 0, y: 0 },
      svgRef: null
    }
    setTabs([...tabs, newTab]);
    setTabCount(newTabCount);
    setActiveTab(newTab.id); // Open the new tab

  };

  function customConfirm(message) {
    return new Promise((resolve, reject) => {
        const confirmation = window.confirm(message);
        resolve(confirmation); // returns true or false
    });
}

  const closeTab = (tabId) => {
    customConfirm("Are you sure you want to delete this tab?")
    .then((result) => {
        if (result) {
            // proceed with deletion
            const updatedTabs = tabs.filter(tab => tab.id !== tabId);
        setTabs(updatedTabs);
        if (activeTab === tabId && updatedTabs.length > 0) {
          setActiveTab(updatedTabs[0].id); // Open the first tab if the active one is closed
        }
        TabMap[tabId] = defaultTab
        } 
    }); 
  };
  // State Management

  // node and their location
  const [nodes, setNodes] = React.useState(() => {
    try {
      return TabMap[activeTab].nodes;
    } catch (error) {
      console.error('Error loading default nodes:', error);
      return [];
    }
  });

    // node and their connection
  const [edges, setEdges] = React.useState(() => {
    try {
      return TabMap[activeTab].edges;
    } catch (error) {
      console.error('Error loading default connections:', error);
      return [];
    }
  });

  const [expandedNodes, setExpandedNodes] = React.useState(new Set(['root']));
  const [hoveredNode, setHoveredNode] = React.useState(null);
  const [selectedNode, setSelectedNode] = React.useState(null);
  const [activeNoteId, setActiveNoteId] = React.useState(null);
  const [activeNoteSummaryId, setActiveNoteSummaryId] = React.useState(null);
  const [noteText, setNoteText] = React.useState('');
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
  let svgRef = React.useRef(null);


  const [newNodeForm, setNewNodeForm] = React.useState({
    label: '',
    type: 'default',
    parent: ''
  });

  // File Management Functions
  const handleSave = async () => {
    const data = {
      nodes: TabMap[activeTab].nodes,
      edges: TabMap[activeTab].edges,
      expandedNodes: Array.from(TabMap[activeTab].expandedNodes),
      tab: activeTab
    };
    const success = await saveToFile(data, 'mindmap-data.json');
    if (success) {
      alert('Mind map saved successfully!');
    } else {
      alert('Failed to save mind map');
    }
  };

  const handleSaveAll = async () => {
    
    const success = await saveToFile(TabMap, 'mindmap-data.json');
      if (success) {
        alert('Mind map saved successfully!');
      } else {
        alert('Failed to save mind map');
      }
  };

  const handleLoad = async () => {
    const data = await loadFromFile();
    if (data) {
      TabMap[activeTab].nodes = data.nodes
      TabMap[activeTab].edges = data.edges
      TabMap[activeTab].expandedNodes = data.expandedNodes
      TabMap[activeTab].hoveredNode =null
      TabMap[activeTab].selectedNode = null
      TabMap[activeTab].activeNoteId = null
      TabMap[activeTab].activeNoteSummaryId = null
      TabMap[activeTab].noteText = ""
      TabMap[activeTab].isDragging = false
      TabMap[activeTab].dragOffset = { x: 0, y: 0 }
      TabMap[activeTab].svgRef = null

      setNodes(TabMap[activeTab].nodes)
      setEdges(TabMap[activeTab].edges)
      setHoveredNode(TabMap[activeTab].hoveredNode)
      setSelectedNode(TabMap[activeTab].selectedNode)
      setActiveNoteId(TabMap[activeTab].activeNoteId)
      setActiveNoteSummaryId(TabMap[activeTab].activeNoteSummaryId)
      setNoteText(TabMap[activeTab].noteText)
      setIsDragging(TabMap[activeTab].isDragging)
      setDragOffset(TabMap[activeTab].dragOffset)
      svgRef = TabMap[activeTab].svgRef
      setExpandedNodes(new Set(data.expandedNodes));
      alert('Mind map loaded successfully!');
    }
  };

  const handleLoadAll = async () => {
    const d = await loadFromFile();

    if (d) {
      for (let k in d) {
        let data = d[k]
        if (TabMap[k] ==undefined){
          TabMap[k] = {}
        }
        TabMap[k].nodes = data.nodes
        TabMap[k].edges = data.edges
        TabMap[k].expandedNodes = data.expandedNodes
        TabMap[k].hoveredNode = null
        TabMap[k].selectedNode = null
        TabMap[k].activeNoteId = null
        TabMap[k].activeNoteSummaryId = null
        TabMap[k].noteText = ""
        TabMap[k].isDragging = false
        TabMap[k].dragOffset = { x: 0, y: 0 }
        TabMap[k].svgRef = null
        const newTab = { id: k, label: k }
        setTabs([...tabs, newTab])
        setTabCount(tabCount + 1)
      }
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
    TabMap[activeTab].visited = visited
    
    const children = getDirectChildren(nodeId);
    let descendants = [...children];
    
    children.forEach(childId => {
      descendants = [...descendants, ...getAllDescendants(childId, visited)];
    });
    
    return descendants;
  };

  const subNodes = (nodeId) => {
    let nodes = []
    edges.forEach(edge =>{
      if (edge.from === nodeId) {
        const subNode = subNodes(edge.to)
        nodes = [...nodes, nodeId, ...subNode]
      }
    })
    return nodes
  }

  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
        const subNode = subNodes(nodeId)
        subNode.forEach(nodeID => {
          newSet.delete(nodeID);
        });
      
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
    
    TabMap[activeTab].nodes = [...nodes, newNode]
    setNodes(TabMap[activeTab].nodes);

    if (newNodeForm.parent) {
      TabMap[activeTab].edges = [...edges, { from: newNodeForm.parent, to: newNode.id }]
      setEdges(TabMap[activeTab].edges);

      TabMap[activeTab].expandedNodes =  new Set([...expandedNodes, newNodeForm.parent])
      setExpandedNodes(TabMap[activeTab].expandedNodes);
    }

    setNewNodeForm({ label: '', type: 'default', parent: '' });
  };

  const removeNode = (nodeId) => {
    const descendants = getAllDescendants(nodeId);
    TabMap[activeTab].nodes = nodes.filter(n => n.id !== nodeId && !descendants.includes(n.id))
    setNodes(TabMap[activeTab].nodes);

    TabMap[activeTab].edges = edges.filter(e => 
      e.from !== nodeId && 
      e.to !== nodeId && 
      !descendants.includes(e.from) && 
      !descendants.includes(e.to)
    )
    setEdges(TabMap[activeTab].edges);

    TabMap[activeTab].selectedNode =null
    setSelectedNode(TabMap[activeTab].selectedNode);
  };

  // Note Management
  const toggleNotePopup = (nodeId, e) => {
    e.stopPropagation();
    if (activeNoteId === nodeId) {
      TabMap[activeTab].activeNoteId =null
      setActiveNoteId(null);
      setNoteText('');
    } else {
      const node = nodes.find(n => n.id === nodeId);
      TabMap[activeTab].activeNoteId =nodeId
      setActiveNoteId(nodeId);
      setNoteText(node.notes || '');
    }
  };

  const toggleNoteSummaryPopup = (nodeId, e) => {
    e.stopPropagation();
    if (activeNoteId === nodeId) {
      TabMap[activeTab].activeNoteSummaryId =null
      setActiveNoteSummaryId(null);
    } else {
      const node = nodes.find(n => n.id === nodeId);
      TabMap[activeTab].activeNoteSummaryId =nodeId
      setActiveNoteSummaryId(nodeId);
    }
  };

  const savePreviousTab = (tabId) => {
    TabMap[activeTab].nodes =nodes
    TabMap[activeTab].edges = edges
    TabMap[activeTab].hoveredNode =hoveredNode
    TabMap[activeTab].selectedNode = selectedNode
    TabMap[activeTab].activeNoteId = activeNoteId
    TabMap[activeTab].noteText = activeNoteId
    TabMap[activeTab].isDragging = isDragging
    TabMap[activeTab].dragOffset = dragOffset
    TabMap[activeTab].svgRef = svgRef
    setActiveTab(tabId)
  }

  const saveNote = (e) => {
    e.stopPropagation();
    TabMap[activeTab].nodes = nodes.map(node => 
      node.id === activeNoteId 
      ? { ...node, notes: noteText }
      : node
    )
    setNodes(nodes);
    TabMap[activeTab].activeNoteId = null
    setActiveNoteId(null);

  };

    // Drag and Drop Functionality
    const handleNodeDragStart = (e, nodeId) => {
      const node = nodes.find(n => n.id === nodeId);
      TabMap[activeTab].dragOffset = dragOffset
      setDragOffset({
        x: 0,
        y: 0
      });

      TabMap[activeTab].isDragging =isDragging
      setIsDragging(true);
      TabMap[activeTab].selectedNode= selectedNode
      setSelectedNode(nodeId);
    };
  
    const handleNodeDrag = (e, nodeId) => {
      console.log(e)
      if (!isDragging || selectedNode !== nodeId) return;
  
      const svgRect = svgRef.current.getBoundingClientRect();
      const newX = e.clientX - svgRect.left - dragOffset.x;
      const newY = e.clientY - svgRect.top - dragOffset.y;
  
      TabMap[activeTab].nodes = nodes.map(node => 
        node.id === nodeId
        ? { ...node, x: newX, y: newY }
        : node
      )
      setNodes(TabMap[activeTab].nodes);
    };
    
    const handleNodeDoubleClick = (e, nodeId) => {
      if (!isDragging || selectedNode !== nodeId) return;
  
      // const svgRect = svgRef.current.getBoundingClientRect();
      // const newX = e.clientX - svgRect.left - dragOffset.x;
      // const newY = e.clientY - svgRect.top - dragOffset.y;
  
      // setNodes(prev => prev.map(node => 
      //   node.id === nodeId
      //     ? { ...node, x: newX, y: newY }
      //     : node
      // ));
    };
  
    const handleNodeDragEnd = () => {
      TabMap[activeTab].isDragging = false
      setIsDragging(false);
    };

    // Memoized Calculations
    const visibleNodes = React.useMemo(() => {
      const visibleNodeIds = new Set();
      
      TabMap[activeTab].nodes.filter(node => node.type === 'root').forEach(node => {
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

              <div className="bg-gray-700 p-4 rounded">
              <p className="mb-2 align-center font-bold text-lg p-2 rounded text-white ">{nodes.find(n => n.id === selectedNode)?.label}</p>
              <button
                className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
                onClick={() => removeNode(selectedNode)}
              >
                Remove Node
              </button>
              <div className="mt-4"> </div>
              <button
                className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
                onClick={() => CopyToNewTab(selectedNode)}
              >
                Copy to New Tab
              </button>
              </div>
            </div>
            
            
          )}


          <div className="mt-4">
              <button
                className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
                onClick={() => handleSaveAll(selectedNode)}
              >
                Save All Tabs
              </button>
            </div>

        <div className="mt-4">
              <button
                className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
                onClick={() => handleLoadAll(selectedNode)}
              >
                Loads Tabs
              </button>
            </div>
        </div>
  
        {/* Graph View */}
        <div className="flex-1 flex-col h-screen "
        >

        <div className="">
            <div className="tabs flex border-b border-gray-300 mb-2">
                <button className="tab-button text-gray-500 hover:text-blue-500 py-2 px-4 focus:outline-none" onClick={addTab}>+ Add Tab</button>
                {tabs.map(tab => (
                    <div key={tab.id} className="flex items-center">
                        <button
                            className={`tab-button py-2 px-4 focus:outline-none ${activeTab === tab.id ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
                            onClick={() => savePreviousTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                        <span
                            className="ml-2 cursor-pointer text-red-500"
                            onClick={() => closeTab(tab.id)}
                        >
                            ✖
                        </span>
                    </div>
                ))}
            </div>
        </div>


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
                onClick={() => toggleNode(node.id)} // Toggle visibility on click
                className="cursor-pointer"
              >
                {/* Node Circle */}
                <circle
                  onMouseDown={(e) => handleNodeDragStart(e, node.id)}
                  onMouseMove={(e) => handleNodeDrag(e, node.id)}
                  cx={node.x}
                  cy={node.y}
                  r={15}
                  onDoubleClick={(e) => handleNodeDoubleClick(e,node.id)} 
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

                <g
                  transform={`translate(${node.x-70}, ${node.y -10})`}
                  onClick={(e) => toggleNoteSummaryPopup(node.id, e)}
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
                    label="Notes"
                    textAnchor="middle"
                    fill={node.notes ? "#ffd700" : "#666"}
                    className="text-xs"
                    style={{ fontSize: '25px' }} // Adjust font size if needed
                  >
                  📓
                  </text> 
                </g>

  
                {/* Note Icon */}
                <g
                  transform={`translate(${node.x - 40}, ${node.y - 10})`}
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
                    style={{ fontSize: '25px' }} // Adjust font size if needed
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
  
                {/* Note Summary Popup */}
                { activeNoteSummaryId === node.id && (
                  <NoteSummary
                  setActiveNoteId={setActiveNoteSummaryId}
                  node={node}
                  nodes={nodes}
                  edges={edges}

                  />
                )}

          
              </g>
              
            ))
            }

          </svg>
        </div>
      </div>
    );
  }
  
  export default App;