'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useParams } from 'next/navigation';
import {
    Sparkles,
    Wand2,
    Type,
    Image as ImageIcon,
    Square,
    Download,
    Save,
    Loader2,
    ArrowLeft,
    Palette,
    Undo2,
    Redo2,
    Upload,
    Layers,
    ChevronUp,
    ChevronDown,
    Circle,
    Scissors,
    Check,
    X,
    PenTool,
} from 'lucide-react';
import { FORMAT_SPECS, DesignFormat, Layout, LayoutElement } from '@/lib/types';
import { getDesign, updateDesign } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';

// Dynamic import to avoid SSR issues with Fabric.js
const FabricCanvas = dynamic(() => import('@/components/FabricCanvas'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
    ),
});

export default function EditDesignPage() {
    const router = useRouter();
    const params = useParams();
    const designId = params.id as string;

    const [canvas, setCanvas] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [format, setFormat] = useState<DesignFormat>('instagram-post');
    const [isSaving, setIsSaving] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [designTitle, setDesignTitle] = useState('Loading...');

    // Selected object state for properties panel
    const [selectedObject, setSelectedObject] = useState<any>(null);
    const [objectProps, setObjectProps] = useState({
        fill: '#000000',
        fontSize: 32,
        fontFamily: 'Inter',
        width: 100,
        height: 100,
        opacity: 1,
        charSpacing: 0,
        textAlign: 'left',
    });

    // History for undo/redo
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [isUndoRedo, setIsUndoRedo] = useState(false);

    // File input ref for image upload
    const fileInputRef = useRef<HTMLInputElement>(null);

    const formatSpec = FORMAT_SPECS[format];

    // Load user and design on mount
    useEffect(() => {
        const loadData = async () => {
            const currentUser = await getCurrentUser();
            setUser(currentUser);

            if (!currentUser) {
                router.push('/login');
                return;
            }

            try {
                const design = await getDesign(designId);
                if (!design) {
                    alert('Design not found');
                    router.push('/dashboard');
                    return;
                }

                setDesignTitle(design.name);
                setFormat(design.format as DesignFormat);

                // Load canvas JSON when canvas is ready
                if (canvas && design.canvasJson) {
                    canvas.loadFromJSON(design.canvasJson, () => {
                        canvas.renderAll();
                        setLoading(false);
                    });
                } else {
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error loading design:', error);
                router.push('/dashboard');
            }
        };

        loadData();
    }, [designId, router]);

    // Load canvas data when canvas becomes ready
    useEffect(() => {
        if (!canvas || !designId) return;

        const loadCanvasData = async () => {
            try {
                const design = await getDesign(designId);
                if (design?.canvasJson) {
                    canvas.loadFromJSON(design.canvasJson, () => {
                        canvas.renderAll();
                    });
                }
            } catch (error) {
                console.error('Error loading canvas data:', error);
            }
        };

        loadCanvasData();
    }, [canvas, designId]);

    const handleCanvasReady = useCallback((fabricCanvas: any) => {
        setCanvas(fabricCanvas);

        fabricCanvas.on('selection:created', (e: any) => {
            const obj = e.selected[0];
            setSelectedObject(obj);
            updatePropsFromObject(obj);
        });

        fabricCanvas.on('selection:updated', (e: any) => {
            const obj = e.selected[0];
            setSelectedObject(obj);
            updatePropsFromObject(obj);
        });

        fabricCanvas.on('selection:cleared', () => {
            setSelectedObject(null);
        });
    }, []);

    const updatePropsFromObject = (obj: any) => {
        if (!obj) return;
        setObjectProps({
            fill: obj.fill || '#000000',
            fontSize: obj.fontSize || 32,
            fontFamily: obj.fontFamily || 'Inter',
            width: Math.round(obj.width * (obj.scaleX || 1)),
            height: Math.round(obj.height * (obj.scaleY || 1)),
            opacity: obj.opacity ?? 1,
            charSpacing: obj.charSpacing ?? 0,
            textAlign: obj.textAlign || 'left',
        });
    };

    const updateObjectProperty = (property: string, value: any) => {
        if (!selectedObject || !canvas) return;

        if (property === 'fill') {
            selectedObject.set('fill', value);
        } else if (property === 'fontSize') {
            selectedObject.set('fontSize', parseInt(value));
        } else if (property === 'fontFamily') {
            selectedObject.set('fontFamily', value);
        } else if (property === 'opacity') {
            selectedObject.set('opacity', parseFloat(value));
        } else if (property === 'charSpacing') {
            selectedObject.set('charSpacing', parseInt(value));
        } else if (property === 'textAlign') {
            selectedObject.set('textAlign', value);
        }

        setObjectProps(prev => ({ ...prev, [property]: value }));
        canvas.renderAll();
        saveToHistory();
    };

    const deleteSelected = () => {
        if (!selectedObject || !canvas) return;
        canvas.remove(selectedObject);
        setSelectedObject(null);
        canvas.renderAll();
        saveToHistory();
    };

    const saveToHistory = () => {
        if (!canvas || isUndoRedo) return;
        const json = JSON.stringify(canvas.toJSON());
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(json);
        if (newHistory.length > 50) newHistory.shift();
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const undo = () => {
        if (!canvas || historyIndex <= 0) return;
        setIsUndoRedo(true);
        const newIndex = historyIndex - 1;
        canvas.loadFromJSON(history[newIndex], () => {
            canvas.renderAll();
            setHistoryIndex(newIndex);
            setSelectedObject(null);
            setIsUndoRedo(false);
        });
    };

    const redo = () => {
        if (!canvas || historyIndex >= history.length - 1) return;
        setIsUndoRedo(true);
        const newIndex = historyIndex + 1;
        canvas.loadFromJSON(history[newIndex], () => {
            canvas.renderAll();
            setHistoryIndex(newIndex);
            setSelectedObject(null);
            setIsUndoRedo(false);
        });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !canvas) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const fabricLib = (window as any).fabric;
            if (!fabricLib) return;

            fabricLib.Image.fromURL(event.target?.result, (img: any) => {
                const maxSize = 400;
                const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
                img.scale(scale);
                img.set({ left: 100, top: 100 });
                canvas.add(img);
                canvas.setActiveObject(img);
                canvas.renderAll();
                saveToHistory();
            });
        };
        reader.readAsDataURL(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const addText = () => {
        if (!canvas) return;
        const fabricLib = (window as any).fabric;
        if (!fabricLib) return;

        const text = new fabricLib.IText('Double click to edit', {
            left: 100,
            top: 100,
            fontSize: 32,
            fill: '#1a1a2a',
            fontFamily: 'Inter',
        });

        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.renderAll();
        saveToHistory();
    };

    const addShape = () => {
        if (!canvas) return;
        const fabricLib = (window as any).fabric;
        if (!fabricLib) return;

        const rect = new fabricLib.Rect({
            left: 100,
            top: 100,
            width: 200,
            height: 100,
            fill: '#9333ea',
        });

        canvas.add(rect);
        canvas.setActiveObject(rect);
        canvas.renderAll();
        saveToHistory();
    };

    const addCircle = () => {
        if (!canvas) return;
        const fabricLib = (window as any).fabric;
        if (!fabricLib) return;

        const circle = new fabricLib.Circle({
            left: 150,
            top: 150,
            radius: 75,
            fill: '#3b82f6',
        });

        canvas.add(circle);
        canvas.setActiveObject(circle);
        canvas.renderAll();
        saveToHistory();
    };

    const saveDesign = async () => {
        if (!canvas || !user) {
            alert('Please log in to save designs');
            return;
        }

        setIsSaving(true);
        try {
            const canvasJson = canvas.toJSON();

            await updateDesign(designId, {
                name: designTitle,
                canvasJson: canvasJson,
                format: format,
            });

            alert('Design saved successfully!');
        } catch (error: any) {
            console.error('Error saving design:', error);
            alert(`Failed to save design: ${error?.message || 'Unknown error'}`);
        } finally {
            setIsSaving(false);
        }
    };

    const exportAsPNG = () => {
        if (!canvas) return;

        const dataURL = canvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 2,
        });

        const link = document.createElement('a');
        link.download = `${designTitle}-${Date.now()}.png`;
        link.href = dataURL;
        link.click();
    };

    const bringForward = () => {
        if (!selectedObject || !canvas) return;
        canvas.bringForward(selectedObject);
        canvas.renderAll();
        saveToHistory();
    };

    const sendBackward = () => {
        if (!selectedObject || !canvas) return;
        canvas.sendBackwards(selectedObject);
        canvas.renderAll();
        saveToHistory();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">Loading design...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Header */}
            <header className="bg-white border-b border-slate-200">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-700"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <input
                                value={designTitle}
                                onChange={(e) => setDesignTitle(e.target.value)}
                                className="text-xl font-bold text-slate-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-1 hover:bg-slate-50"
                            />
                            <p className="text-sm text-slate-500">{formatSpec.name}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={saveDesign}
                            disabled={isSaving}
                            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-100 flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            Save
                        </button>
                        <button
                            onClick={exportAsPNG}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex h-[calc(100vh-73px)]">
                {/* Toolbar */}
                <aside className="w-20 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-4 gap-2">
                    <div className="flex gap-1">
                        <button
                            onClick={undo}
                            disabled={historyIndex <= 0}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 disabled:opacity-30"
                            title="Undo"
                        >
                            <Undo2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={redo}
                            disabled={historyIndex >= history.length - 1}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 disabled:opacity-30"
                            title="Redo"
                        >
                            <Redo2 className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="w-12 h-px bg-slate-200 dark:bg-slate-700 my-2" />

                    <button
                        onClick={addText}
                        className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
                        title="Add Text"
                    >
                        <Type className="w-6 h-6" />
                    </button>
                    <button
                        onClick={addShape}
                        className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
                        title="Add Rectangle"
                    >
                        <Square className="w-6 h-6" />
                    </button>
                    <button
                        onClick={addCircle}
                        className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
                        title="Add Circle"
                    >
                        <Circle className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
                        title="Upload Image"
                    >
                        <Upload className="w-6 h-6" />
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                </aside>

                {/* Properties Panel */}
                {selectedObject && (
                    <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 overflow-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Palette className="w-4 h-4 text-purple-600" />
                                Properties
                            </h2>
                            <button
                                onClick={() => {
                                    if (canvas) canvas.discardActiveObject();
                                    setSelectedObject(null);
                                    if (canvas) canvas.renderAll();
                                }}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Fill Color */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Fill Color
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={objectProps.fill}
                                        onChange={(e) => updateObjectProperty('fill', e.target.value)}
                                        className="w-10 h-10 rounded-lg border border-slate-300 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={objectProps.fill}
                                        onChange={(e) => updateObjectProperty('fill', e.target.value)}
                                        className="flex-1 px-2 py-1.5 border border-slate-300 rounded-lg text-sm"
                                    />
                                </div>
                            </div>

                            {/* Font Size for text */}
                            {(selectedObject.type === 'i-text' || selectedObject.type === 'text') && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Font Size: {objectProps.fontSize}px
                                    </label>
                                    <input
                                        type="range"
                                        min="12"
                                        max="120"
                                        value={objectProps.fontSize}
                                        onChange={(e) => updateObjectProperty('fontSize', e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                            )}

                            {/* Opacity */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Opacity: {Math.round(objectProps.opacity * 100)}%
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={objectProps.opacity}
                                    onChange={(e) => updateObjectProperty('opacity', e.target.value)}
                                    className="w-full"
                                />
                            </div>

                            {/* Layer Controls */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Layer Order
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={bringForward}
                                        className="flex items-center justify-center gap-1 px-2 py-1.5 bg-slate-100 text-slate-700 rounded text-xs hover:bg-slate-200"
                                    >
                                        <ChevronUp className="w-3 h-3" />
                                        Forward
                                    </button>
                                    <button
                                        onClick={sendBackward}
                                        className="flex items-center justify-center gap-1 px-2 py-1.5 bg-slate-100 text-slate-700 rounded text-xs hover:bg-slate-200"
                                    >
                                        <ChevronDown className="w-3 h-3" />
                                        Backward
                                    </button>
                                </div>
                            </div>

                            {/* Delete button */}
                            <button
                                onClick={deleteSelected}
                                className="w-full py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700"
                            >
                                Delete Element
                            </button>
                        </div>
                    </aside>
                )}

                {/* Canvas Area */}
                <main className="flex-1 p-8 overflow-auto flex items-center justify-center min-h-0">
                    <FabricCanvas
                        width={formatSpec.width}
                        height={formatSpec.height}
                        onCanvasReady={handleCanvasReady}
                    />
                </main>
            </div>
        </div>
    );
}
