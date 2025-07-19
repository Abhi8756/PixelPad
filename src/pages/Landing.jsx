import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import jsPDF from 'jspdf';

const Landing = () => {
    const canvasRef = useRef(null);
    const fabricRef = useRef(null);
    const [fontSize, setFontSize] = useState(20);
    const [fontFamily, setFontFamily] = useState('Arial');
    const [isDrawing, setIsDrawing] = useState(false);
    const [isErasing, setIsErasing] = useState(false);
    const [brushColor, setBrushColor] = useState('#000000');
    const [brushWidth, setBrushWidth] = useState(5);

    useEffect(() => {
        const canvas = new fabric.Canvas(canvasRef.current, {
            width: 800,
            height: 600,
            backgroundColor: '#ffffff',
        });

        fabricRef.current = canvas;

        canvas.on('mouse:down', () => {
            const active = canvas.getActiveObject();
            if (active && active.type === 'textbox') {
                setFontSize(active.fontSize || 20);
                setFontFamily(active.fontFamily || 'Arial');
            }
        });

        return () => canvas.dispose();
    }, []);

    const addText = () => {
        setIsDrawing(false);
        setIsErasing(false);
        const canvas = fabricRef.current;
        canvas.isDrawingMode = false;
        canvas.selection = true;

        const textbox = new fabric.Textbox('Edit me!', {
            left: Math.random() * 300 + 50,
            top: Math.random() * 200 + 50,
            fontSize: fontSize,
            fontFamily: fontFamily,
            fill: '#000',
        });

        canvas.add(textbox);
        canvas.setActiveObject(textbox);
    };

    const toggleDrawing = () => {
        const canvas = fabricRef.current;
        const mode = !isDrawing;
        setIsDrawing(mode);
        setIsErasing(false);

        canvas.isDrawingMode = mode;
        canvas.selection = !mode;

        if (mode) {
            canvas.freeDrawingBrush.color = brushColor;
            canvas.freeDrawingBrush.width = brushWidth;

            canvas.getObjects().forEach(obj => {
                obj.selectable = false;
                obj.evented = false;
            });
        } else {
            canvas.getObjects().forEach(obj => {
                if (obj.type === 'textbox') {
                    obj.selectable = true;
                    obj.evented = true;
                }
            });
        }

        canvas.requestRenderAll();
    };

    const toggleEraser = () => {
        const canvas = fabricRef.current;
        const mode = !isErasing;
        setIsErasing(mode);
        setIsDrawing(false);

        canvas.isDrawingMode = mode;
        canvas.selection = !mode;

        if (mode) {
            canvas.freeDrawingBrush.color = '#ffffff';
            canvas.freeDrawingBrush.width = brushWidth;
        }

        canvas.requestRenderAll();
    };

    const updateStyle = (styleType) => {
        const canvas = fabricRef.current;
        const active = canvas.getActiveObject();

        if (active && active.type === 'textbox') {
            switch (styleType) {
                case 'bold':
                    active.set('fontWeight', active.fontWeight === 'bold' ? 'normal' : 'bold');
                    break;
                case 'italic':
                    active.set('fontStyle', active.fontStyle === 'italic' ? 'normal' : 'italic');
                    break;
                case 'underline':
                    active.set('underline', !active.underline);
                    break;
                default:
                    break;
            }
            canvas.requestRenderAll();
        }
    };

    const changeFontSize = (size) => {
        setFontSize(size);
        const active = fabricRef.current.getActiveObject();
        if (active && active.type === 'textbox') {
            active.set('fontSize', size);
            fabricRef.current.requestRenderAll();
        }
    };

    const changeFontFamily = (font) => {
        setFontFamily(font);
        const active = fabricRef.current.getActiveObject();
        if (active && active.type === 'textbox') {
            active.set('fontFamily', font);
            fabricRef.current.requestRenderAll();
        }
    };

    const changeBrushColor = (color) => {
        setBrushColor(color);
        const canvas = fabricRef.current;
        if (canvas.isDrawingMode && isDrawing && canvas.freeDrawingBrush) {
            canvas.freeDrawingBrush.color = color;
        }
    };

    const changeBrushWidth = (width) => {
        setBrushWidth(width);
        const canvas = fabricRef.current;
        if (canvas.isDrawingMode && canvas.freeDrawingBrush) {
            canvas.freeDrawingBrush.width = width;
        }
    };

    const deleteSelected = () => {
        const canvas = fabricRef.current;
        const active = canvas.getActiveObject();
        if (active) {
            canvas.remove(active);
            canvas.requestRenderAll();
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (f) {
            const data = f.target.result;

            fabric.Image.fromURL(data, (img) => {
                img.set({
                    left: 150,
                    top: 150,
                    scaleX: 0.5,
                    scaleY: 0.5,
                });

                fabricRef.current.add(img);
            });
        };
        reader.readAsDataURL(file);
    };

    const exportAsPNG = () => {
        const canvas = fabricRef.current;
        const dataURL = canvas.toDataURL({ format: 'png', multiplier: 2 });

        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'canvas.png';
        link.click();
    };

    const exportAsPDF = () => {
        const canvas = fabricRef.current;
        const dataURL = canvas.toDataURL({ format: 'png', multiplier: 2 });

        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width, canvas.height],
        });

        pdf.addImage(dataURL, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save('canvas.pdf');
    };

    return (
        <div className="flex h-screen w-full bg-slate-950 text-white overflow-hidden">
            {/* Left Sidebar */}
            <div className="w-80 bg-slate-900 border-r border-gray-600 p-6 overflow-y-auto flex-shrink-0">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-purple-400 m-0">PixelPad</h1>
                    <p className="text-slate-400 text-sm mt-1 m-0">Professional Drawing Studio</p>
                </div>

                {/* Drawing Tools */}
                <div className="flex flex-col gap-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-purple-300">Drawing Tools</h3>
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={toggleDrawing} 
                                className={`${isDrawing ? 'bg-purple-600' : 'bg-gray-600'} text-white border-none py-3 px-4 rounded-lg w-full font-medium cursor-pointer hover:opacity-90 transition-opacity`}
                            >
                                {isDrawing ? 'Drawing Active' : 'Draw Mode'}
                            </button>
                            <button 
                                onClick={toggleEraser} 
                                className={`${isErasing ? 'bg-red-600' : 'bg-gray-600'} text-white border-none py-3 px-4 rounded-lg w-full font-medium cursor-pointer hover:opacity-90 transition-opacity`}
                            >
                                {isErasing ? 'Erasing Active' : 'Eraser'}
                            </button>
                        </div>
                    </div>

                    {/* Brush Settings */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-purple-300">Brush Settings</h3>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-slate-300">Color</label>
                                <input 
                                    type="color" 
                                    value={brushColor} 
                                    onChange={(e) => changeBrushColor(e.target.value)} 
                                    disabled={isErasing} 
                                    className="w-full h-12 rounded-lg border-2 border-gray-600 bg-slate-800 cursor-pointer disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-slate-300">
                                    Brush Size: {brushWidth}px
                                </label>
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="30" 
                                    value={brushWidth} 
                                    onChange={(e) => changeBrushWidth(parseInt(e.target.value))} 
                                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Text Tools */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-purple-300">Text Tools</h3>
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={addText} 
                                className="bg-blue-600 text-white border-none py-3 px-4 rounded-lg w-full font-medium cursor-pointer hover:bg-blue-700 transition-colors"
                            >
                                Add Text
                            </button>
                            <button 
                                onClick={deleteSelected} 
                                className="bg-red-600 text-white border-none py-3 px-4 rounded-lg w-full font-medium cursor-pointer hover:bg-red-700 transition-colors"
                            >
                                Delete Selected
                            </button>
                            <select 
                                value={fontFamily} 
                                onChange={(e) => changeFontFamily(e.target.value)} 
                                className="w-full bg-slate-800 border border-gray-600 text-white py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="Arial">Arial</option>
                                <option value="Courier New">Courier New</option>
                                <option value="Georgia">Georgia</option>
                                <option value="Times New Roman">Times New Roman</option>
                                <option value="Verdana">Verdana</option>
                            </select>
                            <input 
                                type="number" 
                                value={fontSize} 
                                onChange={(e) => changeFontSize(parseInt(e.target.value))} 
                                placeholder="Font Size" 
                                className="w-full bg-slate-800 border border-gray-600 text-white py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => updateStyle('bold')} 
                                    className="flex-1 bg-slate-800 text-white border-none py-2 px-3 rounded-lg font-bold cursor-pointer hover:bg-slate-700 transition-colors"
                                >
                                    B
                                </button>
                                <button 
                                    onClick={() => updateStyle('italic')} 
                                    className="flex-1 bg-slate-800 text-white border-none py-2 px-3 rounded-lg italic cursor-pointer hover:bg-slate-700 transition-colors"
                                >
                                    I
                                </button>
                                <button 
                                    onClick={() => updateStyle('underline')} 
                                    className="flex-1 bg-slate-800 text-white border-none py-2 px-3 rounded-lg underline cursor-pointer hover:bg-slate-700 transition-colors"
                                >
                                    U
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Import/Export */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-purple-300">Import & Export</h3>
                        <div className="flex flex-col gap-3">
                            <label className="bg-green-600 text-white py-3 px-4 rounded-lg w-full block text-center cursor-pointer font-medium hover:bg-green-700 transition-colors">
                                Upload Image
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleImageUpload} 
                                    className="hidden"
                                />
                            </label>
                            <button 
                                onClick={exportAsPNG} 
                                className="bg-yellow-600 text-white border-none py-3 px-4 rounded-lg w-full font-medium cursor-pointer hover:bg-yellow-700 transition-colors"
                            >
                                Export PNG
                            </button>
                            <button 
                                onClick={exportAsPDF} 
                                className="bg-red-600 text-white border-none py-3 px-4 rounded-lg w-full font-medium cursor-pointer hover:bg-red-700 transition-colors"
                            >
                                Export PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Canvas Area */}
            <div className="flex-1 bg-slate-950 p-6 flex flex-col min-w-0">
                <div className="bg-slate-900 rounded-lg p-6 flex-1 flex items-center justify-center min-h-0">
                    <canvas 
                        ref={canvasRef} 
                        className="border-2 border-gray-600 rounded-lg bg-white shadow-2xl max-w-full max-h-full"
                    />
                </div>
                
                {/* Footer */}
                
            </div>
        </div>
    );
};

export default Landing;
