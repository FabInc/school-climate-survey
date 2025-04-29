<script>
  import { onMount, afterUpdate, tick } from 'svelte';
  import { isEmpty } from './utils.js';
  
  export let nodes = {};
  export let recs = [];
  export let links = [];
  export let width = 600;
  export let height = 400;
  export let activeNode = '';
  
  let canvas;
  let ctx;
  let nodeElements = {};
  let recElements = {};
  let layout = { nodes: {}, recommendations: {} };
  let dragging = false;
  let dragStartPos = { x: 0, y: 0 };
  let offset = { x: 0, y: 0 };
  let scale = 1;
  
  const NODE_COLORS = {
    'default': { bg: '#e0f2fe', border: '#0ea5e9', text: '#0c4a6e' },
    'selected': { bg: '#bae6fd', border: '#0284c7', text: '#0c4a6e' }
  };
  
  const REC_COLORS = {
    'high': { bg: '#fee2e2', border: '#ef4444', text: '#7f1d1d' },
    'medium': { bg: '#fef3c7', border: '#f59e0b', text: '#78350f' },
    'low': { bg: '#d1fae5', border: '#10b981', text: '#064e3b' },
    'default': { bg: '#e0f2fe', border: '#0ea5e9', text: '#0c4a6e' },
    'selected': { bg: '#bae6fd', border: '#0284c7', text: '#0c4a6e' }
  };
  
  // Events
  export let onNodeClick = (nodeId) => {};
  export let onRecClick = (recId) => {};
  
  onMount(() => {
    ctx = canvas.getContext('2d');
    
    // Set up event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('wheel', handleWheel);
    
    // Initial layout calculation
    calculateLayout();
    render();
    
    // Cleanup on destroy
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('wheel', handleWheel);
    };
  });
  
  afterUpdate(async () => {
    // Wait for the DOM to update
    await tick();
    calculateLayout();
    render();
  });
  
  function calculateLayout() {
    layout = { nodes: {}, recommendations: {} };
    
    // Group nodes by levels
    const nodesByLevel = {};
    const nodeIds = Object.keys(nodes);
    
    // First node is at level 0, subsequent nodes are determined by connections
    if (nodeIds.length > 0) {
      const rootNodeId = nodeIds[0];
      nodesByLevel[0] = [rootNodeId];
      let processedNodes = new Set([rootNodeId]);
      
      // Map connections to determine levels
      let currentLevel = 0;
      let allNodesAssigned = false;
      
      while (!allNodesAssigned) {
        const nextLevelNodes = [];
        const nodesInCurrentLevel = nodesByLevel[currentLevel] || [];
        
        // For each node in the current level, find its next nodes
        for (const nodeId of nodesInCurrentLevel) {
          const node = nodes[nodeId];
          if (node && node.next) {
            Object.values(node.next).forEach(nextNodeId => {
              if (!nextNodeId.startsWith('rec:') && nextNodeId !== 'end' && !processedNodes.has(nextNodeId)) {
                nextLevelNodes.push(nextNodeId);
                processedNodes.add(nextNodeId);
              }
            });
          }
        }
        
        if (nextLevelNodes.length > 0) {
          currentLevel++;
          nodesByLevel[currentLevel] = nextLevelNodes;
        } else {
          // If there are still unprocessed nodes, add them to the next level
          const unprocessedNodes = nodeIds.filter(id => !processedNodes.has(id));
          if (unprocessedNodes.length > 0) {
            currentLevel++;
            nodesByLevel[currentLevel] = unprocessedNodes;
            unprocessedNodes.forEach(id => processedNodes.add(id));
          } else {
            allNodesAssigned = true;
          }
        }
      }
    }
    
    // Position nodes based on their level
    Object.entries(nodesByLevel).forEach(([level, nodesInLevel]) => {
      const levelNum = parseInt(level, 10);
      const levelWidth = nodesInLevel.length * nodeSpacing;
      const startX = (canvasSize.width - levelWidth) / 2 + nodeSpacing / 2;
      
      nodesInLevel.forEach((nodeId, index) => {
        layout.nodes[nodeId] = {
          x: startX + index * nodeSpacing,
          y: 100 + levelNum * levelHeight,
          width: 120,
          height: 60
        };
      });
    });
    
    // Position recommendations
    const recIds = Object.keys(recommendations);
    const recCount = recIds.length;
    if (recCount > 0) {
      const recWidth = 100;
      const recHeight = 60;
      const recStartY = canvasSize.height - 100;
      const recSpacing = Math.min(nodeSpacing, (canvasSize.width - 200) / recCount);
      const recStartX = (canvasSize.width - (recCount - 1) * recSpacing - recWidth) / 2;
      
      recIds.forEach((recId, index) => {
        layout.recommendations[recId] = {
          x: recStartX + index * recSpacing,
          y: recStartY,
          width: recWidth,
          height: recHeight
        };
      });
    }
  }
  
  function render() {
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    
    // Apply transformations for pan and zoom
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);
    
    // Draw connections between nodes
    drawConnections();
    
    // Draw nodes
    drawNodes();
    
    // Draw recommendations
    drawRecommendations();
    
    // Restore canvas state
    ctx.restore();
  }
  
  function drawNodes() {
    Object.entries(nodes).forEach(([nodeId, node]) => {
      const pos = layout.nodes[nodeId];
      if (!pos) return;
      
      const isSelected = nodeId === selectedNodeId;
      const colors = isSelected ? NODE_COLORS.selected : NODE_COLORS.default;
      
      // Draw node rectangle
      ctx.fillStyle = colors.bg;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 2;
      
      drawRoundedRect(pos.x, pos.y, pos.width, pos.height, 8);
      ctx.fill();
      ctx.stroke();
      
      // Draw node text
      ctx.fillStyle = colors.text;
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const text = node.text || nodeId;
      const truncatedText = truncateText(text, pos.width - 20);
      ctx.fillText(truncatedText, pos.x + pos.width / 2, pos.y + pos.height / 2);
      
      // Store node element for click detection
      nodeElements[nodeId] = { ...pos };
    });
  }
  
  function drawRecommendations() {
    Object.entries(recommendations).forEach(([recId, rec]) => {
      const pos = layout.recommendations[recId];
      if (!pos) return;
      
      const isSelected = recId === selectedRecId;
      const priority = rec.priority || 'default';
      const colors = isSelected ? REC_COLORS.selected : REC_COLORS[priority] || REC_COLORS.default;
      
      // Draw recommendation rectangle
      ctx.fillStyle = colors.bg;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 2;
      
      // Draw as a hexagon
      drawHexagon(pos.x + pos.width / 2, pos.y + pos.height / 2, pos.width / 2, pos.height / 2);
      ctx.fill();
      ctx.stroke();
      
      // Draw recommendation text
      ctx.fillStyle = colors.text;
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const text = rec.text || recId;
      const truncatedText = truncateText(text, pos.width - 20);
      ctx.fillText(truncatedText, pos.x + pos.width / 2, pos.y + pos.height / 2);
      
      // Store recommendation element for click detection
      recElements[recId] = { ...pos };
    });
  }
  
  function drawConnections() {
    Object.entries(nodes).forEach(([nodeId, node]) => {
      if (!node.next) return;
      
      const startPos = layout.nodes[nodeId];
      if (!startPos) return;
      
      const startX = startPos.x + startPos.width / 2;
      const startY = startPos.y + startPos.height;
      
      Object.entries(node.next).forEach(([option, targetId]) => {
        // Skip connections to non-existent nodes
        if (targetId === 'end') {
          // Draw end marker
          ctx.fillStyle = '#d1d5db';
          ctx.strokeStyle = '#9ca3af';
          ctx.lineWidth = 2;
          
          const endX = startX;
          const endY = startY + 40;
          
          // Draw end circle
          ctx.beginPath();
          ctx.arc(endX, endY, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
          // Draw line to end marker
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY - 10);
          ctx.stroke();
          
          // Add option text along the line
          drawOptionText(option, startX, startY, endX, endY - 10);
          
          return;
        }
        
        if (targetId.startsWith('rec:')) {
          // Connection to a recommendation
          const recId = targetId.replace('rec:', '');
          const endPos = layout.recommendations[recId];
          
          if (!endPos) return;
          
          const endX = endPos.x + endPos.width / 2;
          const endY = endPos.y;
          
          // Draw line
          drawCurvedLine(startX, startY, endX, endY, '#9ca3af');
          
          // Draw arrow
          drawArrowhead(endX, endY, Math.PI * 1.5);
          
          // Add option text along the line
          drawOptionText(option, startX, startY, endX, endY);
        } else {
          // Connection to another node
          const endPos = layout.nodes[targetId];
          
          if (!endPos) return;
          
          const endX = endPos.x + endPos.width / 2;
          const endY = endPos.y;
          
          // Draw line
          drawCurvedLine(startX, startY, endX, endY, '#9ca3af');
          
          // Draw arrow
          drawArrowhead(endX, endY, Math.PI * 1.5);
          
          // Add option text along the line
          drawOptionText(option, startX, startY, endX, endY);
        }
      });
    });
  }
  
  function drawCurvedLine(x1, y1, x2, y2, color) {
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2 - distance / 4;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(midX, midY, x2, y2);
    ctx.stroke();
  }
  
  function drawArrowhead(x, y, angle) {
    const arrowSize = 8;
    
    ctx.fillStyle = '#9ca3af';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - arrowSize * Math.cos(angle - Math.PI/6), y - arrowSize * Math.sin(angle - Math.PI/6));
    ctx.lineTo(x - arrowSize * Math.cos(angle + Math.PI/6), y - arrowSize * Math.sin(angle + Math.PI/6));
    ctx.closePath();
    ctx.fill();
  }
  
  function drawOptionText(option, x1, y1, x2, y2) {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2 - 10;
    
    ctx.fillStyle = '#4b5563';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add a small white background for the text
    const textWidth = ctx.measureText(option).width;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(midX - textWidth/2 - 4, midY - 8, textWidth + 8, 16);
    
    // Draw the text
    ctx.fillStyle = '#4b5563';
    ctx.fillText(option, midX, midY);
  }
  
  function drawRoundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
  }
  
  function drawHexagon(centerX, centerY, width, height) {
    const sideLength = width / 2;
    
    ctx.beginPath();
    ctx.moveTo(centerX + width, centerY);
    ctx.lineTo(centerX + width/2, centerY + height);
    ctx.lineTo(centerX - width/2, centerY + height);
    ctx.lineTo(centerX - width, centerY);
    ctx.lineTo(centerX - width/2, centerY - height);
    ctx.lineTo(centerX + width/2, centerY - height);
    ctx.closePath();
  }
  
  function truncateText(text, maxWidth) {
    if (!text) return '';
    
    if (ctx.measureText(text).width <= maxWidth) {
      return text;
    }
    
    let truncated = text;
    while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
      truncated = truncated.slice(0, -1);
    }
    
    return truncated + '...';
  }
  
  function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
    const y = (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
    
    dragStartPos = { x, y };
    dragging = true;
  }
  
  function handleMouseMove(e) {
    if (!dragging) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
    const y = (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
    
    offset.x += x - dragStartPos.x;
    offset.y += y - dragStartPos.y;
    
    dragStartPos = { x, y };
    render();
  }
  
  function handleMouseUp() {
    dragging = false;
  }
  
  function handleClick(e) {
    const rect = canvas.getBoundingClientRect();
    let x = (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
    let y = (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
    
    // Adjust for pan and zoom
    x = (x - offset.x) / scale;
    y = (y - offset.y) / scale;
    
    // Check if a node was clicked
    let clickedNodeId = null;
    Object.entries(nodeElements).forEach(([nodeId, node]) => {
      if (
        x >= node.x && 
        x <= node.x + node.width && 
        y >= node.y && 
        y <= node.y + node.height
      ) {
        clickedNodeId = nodeId;
      }
    });
    
    if (clickedNodeId) {
      onNodeClick(clickedNodeId);
      return;
    }
    
    // Check if a recommendation was clicked
    let clickedRecId = null;
    Object.entries(recElements).forEach(([recId, rec]) => {
      // Simple rectangular hit detection - could be improved for hexagons
      if (
        x >= rec.x && 
        x <= rec.x + rec.width && 
        y >= rec.y && 
        y <= rec.y + rec.height
      ) {
        clickedRecId = recId;
      }
    });
    
    if (clickedRecId) {
      onRecClick(clickedRecId);
    }
  }
  
  function handleWheel(e) {
    e.preventDefault();
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
    const mouseY = (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
    
    // Calculate mouse position relative to canvas with current pan
    const x = (mouseX - offset.x) / scale;
    const y = (mouseY - offset.y) / scale;
    
    // Adjust scale - limit min/max zoom
    const zoomIntensity = 0.1;
    const zoomDirection = e.deltaY < 0 ? 1 : -1;
    const newScale = Math.max(0.5, Math.min(2, scale + zoomDirection * zoomIntensity));
    
    // Adjust offset to zoom toward mouse position
    if (newScale !== scale) {
      offset.x = mouseX - x * newScale;
      offset.y = mouseY - y * newScale;
      scale = newScale;
      render();
    }
  }
  
  // Public methods
  export function resetView() {
    offset = { x: 0, y: 0 };
    scale = 1;
    render();
  }
  
  export function exportAsPNG() {
    return canvas.toDataURL('image/png');
  }
</script>

<div class="graph-container">
  <canvas 
    bind:this={canvas}
    width={canvasSize.width}
    height={canvasSize.height}
    class="graph-canvas"
  ></canvas>
  
  <div class="graph-controls">
    <button 
      class="graph-control-button"
      on:click={resetView}
      title="Reset view"
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
      </svg>
    </button>
    
    <div class="zoom-level">
      {Math.round(scale * 100)}%
    </div>
  </div>
</div>

<style>
  .graph-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #f9fafb;
  }
  
  .graph-canvas {
    display: block;
    background: #fff;
  }
  
  .graph-controls {
    position: absolute;
    right: 16px;
    bottom: 16px;
    display: flex;
    gap: 8px;
    align-items: center;
    background: rgba(255, 255, 255, 0.8);
    padding: 4px 8px;
    border-radius: 4px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
  
  .graph-control-button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    width: 28px;
    height: 28px;
    cursor: pointer;
  }
  
  .graph-control-button:hover {
    background: #f3f4f6;
  }
  
  .zoom-level {
    font-size: 12px;
    color: #4b5563;
    min-width: 40px;
    text-align: center;
  }
</style> 