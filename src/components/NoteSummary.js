// components/Notes.jsx  
import * as React from 'react';  

const NoteSummary = ({ setActiveNoteId, activeNoteSummaryId, node, nodes, edges }) => {  
  const notePopupRef = React.useRef(null);  

  const transverse = (curNode, nodes, edges, prefix) => {  
    let list = [];  
    let nod = nodes.find((n) => n.id === curNode);  
    list.push(prefix + "| " + nod.label + " |") ;  
    for (let i = 0; i < edges.length; i++) {  
      if (edges[i].from === curNode) {  
        let pre = prefix;
        for (let j = 0; j < nod.label.length; j++) {
          pre += "-";
        }
        list.push(...transverse(edges[i].to, nodes, edges, pre));  
      }  
    }  
    return list;  
  };  

  React.useEffect(() => {  
    const handleClickOutside = (event) => {  
      if (notePopupRef.current && !notePopupRef.current.contains(event.target)) {  
        setActiveNoteId(null);  
      }  
    };  

    document.addEventListener('mousedown', handleClickOutside);  
    return () => document.removeEventListener('mousedown', handleClickOutside);  
  }, [setActiveNoteId]);  

  const list = [];  
  for (let i = 0; i < edges.length; i++) {  
    if (edges[i].from === node.id) {  
      list.push(...transverse(edges[i].to, nodes, edges, ""));  
    }  
  }  

  return (  
    <foreignObject x={node.x + 100} y={node.y - 100} width="500" height="550" fontSize={"50"}>  
      <div  
        ref={notePopupRef}  
        className="bg-gray-900 pt-6 pr-6 pl-6 rounded-lg border border-gray-700 shadow-2xl h-full flex flex-col font-sans text-white"  
      >  
        {/* Header Section */}  
        <div className="flex justify-between items-center mb-4">  
          <h2 className="text-xl font-bold">{node.label}</h2>  
          <button  
            onClick={() => setActiveNoteId(null)}  
            className="text-gray-400 hover:text-white transition"  
          >  
            ✖  
          </button>  
        </div>  

        {/* List Section */}  
        <div className="flex flex-col space-y-2 overflow-y-auto max-h-96 pr-2">  
          {list.map((item, index) => (  
            <div  
              key={index}  
              className="flex items-center space-x-2 text-lg text-gray-300"  
            >  
              <span className="text-green-400">•</span>  
              <span>{item}</span>  
            </div>  
          ))}  
        </div>  
      </div>  
    </foreignObject>  
  );  
};  

export default NoteSummary;  