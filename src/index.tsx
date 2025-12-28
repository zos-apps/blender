import React, { useState, useRef, useEffect } from 'react';

interface BlenderProps {
  onClose: () => void;
}

interface SceneObject {
  id: string;
  name: string;
  type: 'cube' | 'sphere' | 'cylinder' | 'plane' | 'light' | 'camera';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  visible: boolean;
}

const mockObjects: SceneObject[] = [
  { id: '1', name: 'Cube', type: 'cube', position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], visible: true },
  { id: '2', name: 'Light', type: 'light', position: [4, 4, 4], rotation: [0, 0, 0], scale: [1, 1, 1], visible: true },
  { id: '3', name: 'Camera', type: 'camera', position: [7, 5, 7], rotation: [-30, 45, 0], scale: [1, 1, 1], visible: true },
];

const Blender: React.FC<BlenderProps> = ({ onClose }) => {
  const [objects, setObjects] = useState(mockObjects);
  const [selectedId, setSelectedId] = useState<string | null>('1');
  const [mode, setMode] = useState<'object' | 'edit' | 'sculpt'>('object');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const selectedObject = objects.find(o => o.id === selectedId);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Draw 3D viewport (simplified)
    ctx.fillStyle = '#3d3d3d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#4a4a4a';
    ctx.lineWidth = 1;
    const gridSize = 40;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    for (let i = -10; i <= 10; i++) {
      ctx.beginPath();
      ctx.moveTo(centerX + i * gridSize, 0);
      ctx.lineTo(centerX + i * gridSize, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, centerY + i * gridSize);
      ctx.lineTo(canvas.width, centerY + i * gridSize);
      ctx.stroke();
    }

    // Draw axes
    ctx.lineWidth = 2;
    // X axis (red)
    ctx.strokeStyle = '#ff4444';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + 100, centerY);
    ctx.stroke();
    // Y axis (green)
    ctx.strokeStyle = '#44ff44';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX, centerY - 100);
    ctx.stroke();
    // Z axis (blue)
    ctx.strokeStyle = '#4444ff';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX - 50, centerY + 50);
    ctx.stroke();

    // Draw cube
    const cubeSize = 60;
    ctx.strokeStyle = selectedId === '1' ? '#ff9900' : '#ffffff';
    ctx.lineWidth = 2;

    // Front face
    ctx.strokeRect(centerX - cubeSize/2, centerY - cubeSize/2, cubeSize, cubeSize);
    // Back face offset
    ctx.strokeRect(centerX - cubeSize/2 - 20, centerY - cubeSize/2 - 20, cubeSize, cubeSize);
    // Connect corners
    ctx.beginPath();
    ctx.moveTo(centerX - cubeSize/2, centerY - cubeSize/2);
    ctx.lineTo(centerX - cubeSize/2 - 20, centerY - cubeSize/2 - 20);
    ctx.moveTo(centerX + cubeSize/2, centerY - cubeSize/2);
    ctx.lineTo(centerX + cubeSize/2 - 20, centerY - cubeSize/2 - 20);
    ctx.moveTo(centerX + cubeSize/2, centerY + cubeSize/2);
    ctx.lineTo(centerX + cubeSize/2 - 20, centerY + cubeSize/2 - 20);
    ctx.moveTo(centerX - cubeSize/2, centerY + cubeSize/2);
    ctx.lineTo(centerX - cubeSize/2 - 20, centerY + cubeSize/2 - 20);
    ctx.stroke();

  }, [selectedId]);

  const updateObject = (id: string, updates: Partial<SceneObject>) => {
    setObjects(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  return (
    <div className="h-full flex flex-col bg-[#303030] text-white text-sm">
      {/* Top Menu */}
      <div className="h-6 bg-[#252525] flex items-center px-2 gap-4 text-xs border-b border-black">
        {['File', 'Edit', 'Render', 'Window', 'Help'].map(menu => (
          <button key={menu} className="hover:text-blue-400">{menu}</button>
        ))}
      </div>

      {/* Header Toolbar */}
      <div className="h-8 bg-[#3d3d3d] flex items-center px-2 gap-2 border-b border-black">
        <select
          value={mode}
          onChange={e => setMode(e.target.value as any)}
          className="bg-[#505050] px-2 py-1 rounded text-xs"
        >
          <option value="object">Object Mode</option>
          <option value="edit">Edit Mode</option>
          <option value="sculpt">Sculpt Mode</option>
        </select>
        <div className="w-px h-4 bg-black/50 mx-2" />
        <button className="p-1 hover:bg-white/10 rounded">📦 Add</button>
        <button className="p-1 hover:bg-white/10 rounded">🗑️</button>
        <div className="flex-1" />
        <button className="px-2 py-1 bg-orange-600 hover:bg-orange-500 rounded text-xs">Render</button>
      </div>

      <div className="flex-1 flex">
        {/* Outliner */}
        <div className="w-52 bg-[#282828] border-r border-black flex flex-col">
          <div className="p-2 text-xs font-semibold text-white/50 border-b border-black">Scene Collection</div>
          <div className="flex-1 overflow-auto p-1">
            {objects.map(obj => (
              <div
                key={obj.id}
                onClick={() => setSelectedId(obj.id)}
                className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer
                  ${selectedId === obj.id ? 'bg-blue-600/40' : 'hover:bg-white/10'}
                `}
              >
                <span>
                  {obj.type === 'cube' ? '📦' :
                   obj.type === 'light' ? '💡' :
                   obj.type === 'camera' ? '📷' : '⬜'}
                </span>
                <span className="flex-1 truncate">{obj.name}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); updateObject(obj.id, { visible: !obj.visible }); }}
                  className="opacity-50 hover:opacity-100"
                >
                  {obj.visible ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 3D Viewport */}
        <div className="flex-1 relative">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          <div className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded text-xs">
            View: Perspective
          </div>
          <div className="absolute bottom-2 left-2 flex gap-1">
            <button className="p-1 bg-black/50 rounded hover:bg-black/70">🔄</button>
            <button className="p-1 bg-black/50 rounded hover:bg-black/70">✋</button>
            <button className="p-1 bg-black/50 rounded hover:bg-black/70">🔍</button>
          </div>
        </div>

        {/* Properties Panel */}
        <div className="w-72 bg-[#282828] border-l border-black overflow-auto">
          <div className="p-2">
            <div className="flex gap-1 mb-3">
              {['🎬', '🌍', '📦', '🔧', '🎨'].map((icon, i) => (
                <button key={i} className="p-2 hover:bg-white/10 rounded">{icon}</button>
              ))}
            </div>

            {selectedObject && (
              <>
                <div className="bg-[#3d3d3d] rounded p-3 mb-2">
                  <div className="text-xs font-semibold text-white/70 mb-2">Transform</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-12 text-xs text-white/50">Location</span>
                      <input type="number" defaultValue={selectedObject.position[0]} className="w-16 px-1 py-0.5 bg-[#505050] rounded text-xs" />
                      <input type="number" defaultValue={selectedObject.position[1]} className="w-16 px-1 py-0.5 bg-[#505050] rounded text-xs" />
                      <input type="number" defaultValue={selectedObject.position[2]} className="w-16 px-1 py-0.5 bg-[#505050] rounded text-xs" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-12 text-xs text-white/50">Rotation</span>
                      <input type="number" defaultValue={selectedObject.rotation[0]} className="w-16 px-1 py-0.5 bg-[#505050] rounded text-xs" />
                      <input type="number" defaultValue={selectedObject.rotation[1]} className="w-16 px-1 py-0.5 bg-[#505050] rounded text-xs" />
                      <input type="number" defaultValue={selectedObject.rotation[2]} className="w-16 px-1 py-0.5 bg-[#505050] rounded text-xs" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-12 text-xs text-white/50">Scale</span>
                      <input type="number" defaultValue={selectedObject.scale[0]} className="w-16 px-1 py-0.5 bg-[#505050] rounded text-xs" />
                      <input type="number" defaultValue={selectedObject.scale[1]} className="w-16 px-1 py-0.5 bg-[#505050] rounded text-xs" />
                      <input type="number" defaultValue={selectedObject.scale[2]} className="w-16 px-1 py-0.5 bg-[#505050] rounded text-xs" />
                    </div>
                  </div>
                </div>

                {selectedObject.type === 'cube' && (
                  <div className="bg-[#3d3d3d] rounded p-3">
                    <div className="text-xs font-semibold text-white/70 mb-2">Modifiers</div>
                    <button className="w-full py-1 bg-[#505050] hover:bg-[#606060] rounded text-xs">
                      + Add Modifier
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="h-24 bg-[#252525] border-t border-black p-2">
        <div className="flex items-center gap-2 mb-2">
          <button className="p-1 hover:bg-white/10 rounded">⏮</button>
          <button className="p-1 hover:bg-white/10 rounded">◀</button>
          <button className="p-1 hover:bg-white/10 rounded">▶</button>
          <button className="p-1 hover:bg-white/10 rounded">⏭</button>
          <span className="text-xs text-white/50 ml-2">Frame: 1 / 250</span>
        </div>
        <div className="h-8 bg-[#3d3d3d] rounded flex items-center">
          <div className="w-2 h-full bg-blue-500 rounded-l" />
        </div>
      </div>
    </div>
  );
};

export default Blender;
