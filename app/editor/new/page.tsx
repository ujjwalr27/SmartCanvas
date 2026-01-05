'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
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
import { createDesign, updateDesign } from '@/lib/database';
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

export default function EditorPage() {
    const router = useRouter();
    const [canvas, setCanvas] = useState<any>(null);
    const [currentLayout, setCurrentLayout] = useState<Layout | null>(null);
    const [format, setFormat] = useState<DesignFormat>('instagram-post');
    const [showAIWizard, setShowAIWizard] = useState(true);
    const [loading, setLoading] = useState(false);

    // Save design state
    const [isSaving, setIsSaving] = useState(false);
    const [designId, setDesignId] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

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
    const activeLassoLinesRef = useRef<any[]>([]);

    // Design Title
    const [designTitle, setDesignTitle] = useState('New Design');

    // Crop State
    const [isCropping, setIsCropping] = useState(false);
    const [cropObject, setCropObject] = useState<any>(null);
    const [cropTarget, setCropTarget] = useState<any>(null);
    const [lassoPoints, setLassoPoints] = useState<any[]>([]);
    const [cropShapeType, setCropShapeType] = useState<string | null>(null);

    // AI Wizard state
    const [prompt, setPrompt] = useState('');
    const [productName, setProductName] = useState('');
    const [offer, setOffer] = useState('');
    const [generatedLayouts, setGeneratedLayouts] = useState<Layout[]>([]);

    const formatSpec = FORMAT_SPECS[format];

    const handleCanvasReady = useCallback((fabricCanvas: any) => {
        setCanvas(fabricCanvas);

        // Listen for selection changes
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

    // Load user on mount
    useEffect(() => {
        const loadUser = async () => {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        };
        loadUser();
    }, []);

    // Save design function
    const saveDesign = async () => {
        if (!canvas) {
            alert('Canvas not ready');
            return;
        }

        if (!user) {
            alert('Please log in to save designs');
            router.push('/login');
            return;
        }

        setIsSaving(true);
        try {
            const canvasJson = canvas.toJSON();
            console.log('Saving design for user:', user.id);
            console.log('Canvas JSON:', canvasJson);

            if (designId) {
                // Update existing design
                await updateDesign(designId, {
                    name: designTitle,
                    canvasJson: canvasJson,
                    format: format,
                });
                console.log('Design updated:', designId);
            } else {
                // Create new design
                const newDesign = await createDesign({
                    userId: user.id,
                    name: designTitle,
                    canvasJson: canvasJson,
                    format: format,
                    status: 'draft',
                    version: 1,
                });
                console.log('New design created:', newDesign);
                setDesignId(newDesign.id);
            }

            alert('Design saved successfully!');
        } catch (error: any) {
            console.error('Error saving design:', error);
            console.error('Error message:', error?.message);
            console.error('Error details:', JSON.stringify(error, null, 2));
            alert(`Failed to save design: ${error?.message || 'Unknown error'}`);
        } finally {
            setIsSaving(false);
        }
    };

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

    // Crop Functions
    const startCrop = (shape: 'rect' | 'circle' | 'lasso' = 'rect') => {
        if (!selectedObject || !canvas || selectedObject.type !== 'image') return;

        setIsCropping(true);
        setCropShapeType(shape);
        const obj = selectedObject;
        setCropTarget(obj);

        // Lock image
        obj.set({
            selectable: false,
            evented: false,
            opacity: 0.5
        });

        if (shape === 'lasso') {
            setLassoPoints([]);
            activeLassoLinesRef.current = [];
            canvas.defaultCursor = 'crosshair';
            canvas.discardActiveObject();
            canvas.renderAll();
            return;
        }

        // Calculate bounds
        const width = obj.width * obj.scaleX;
        const height = obj.height * obj.scaleY;
        const left = obj.left;
        const top = obj.top;

        // Create crop overlay
        const fabricLib = (window as any).fabric;
        let cropOverlay;

        if (shape === 'circle') {
            const radius = Math.min(width, height) / 2;
            cropOverlay = new fabricLib.Circle({
                left: left + width / 2 - radius,
                top: top + height / 2 - radius,
                radius: radius,
                fill: 'rgba(0,0,0,0.3)',
                stroke: '#fff',
                strokeWidth: 2,
                strokeDashArray: [5, 5],
                cornerColor: '#fff',
                borderColor: '#fff',
                transparentCorners: false,
                hasRotatingPoint: false,
                lockRotation: true,
            });
        } else {
            cropOverlay = new fabricLib.Rect({
                left: left,
                top: top,
                width: width,
                height: height,
                fill: 'rgba(0,0,0,0.3)',
                stroke: '#fff',
                strokeWidth: 2,
                strokeDashArray: [5, 5],
                cornerColor: '#fff',
                borderColor: '#fff',
                transparentCorners: false,
                hasRotatingPoint: false,
                lockRotation: true,
            });
        }

        canvas.add(cropOverlay);
        canvas.setActiveObject(cropOverlay);
        setCropObject(cropOverlay);

        canvas.renderAll();
    };

    const applyCrop = () => {
        if (!cropTarget || !canvas) return;

        // Lasso Logic
        if (cropShapeType === 'lasso') {
            if (lassoPoints.length < 3) return;
            const fabricLib = (window as any).fabric;
            const mask = new fabricLib.Polygon(lassoPoints, {
                absolutePositioned: true
            });

            cropTarget.set({
                clipPath: mask,
                selectable: true,
                evented: true,
                opacity: 1,
            });

            // Cleanup lines
            activeLassoLinesRef.current.forEach((line: any) => canvas.remove(line));
            activeLassoLinesRef.current = [];
            setLassoPoints([]);

            setIsCropping(false);
            setCropTarget(null);
            setCropShapeType(null);
            canvas.defaultCursor = 'default';
            canvas.setActiveObject(cropTarget);
            canvas.renderAll();
            saveToHistory();
            return;
        }

        if (!cropObject) return;

        const image = cropTarget;
        const mask = cropObject;

        mask.clone((clonedMask: any) => {
            clonedMask.set({
                absolutePositioned: true,
                left: mask.left,
                top: mask.top,
                scaleX: mask.scaleX,
                scaleY: mask.scaleY,
                width: mask.width,
                height: mask.height,
                radius: mask.radius,
                angle: mask.angle || 0
            });

            image.set({
                clipPath: clonedMask,
                selectable: true,
                evented: true,
                opacity: 1,
            });

            canvas.remove(mask);
            setCropObject(null);
            setCropTarget(null);
            setIsCropping(false);
            setCropShapeType(null);
            canvas.setActiveObject(image);
            canvas.renderAll();
            saveToHistory();
        });
    };

    const cancelCrop = () => {
        if (!cropTarget || !canvas) return;

        // Cleanup Lasso
        if (cropShapeType === 'lasso') {
            activeLassoLinesRef.current.forEach((line: any) => canvas.remove(line));
            activeLassoLinesRef.current = [];
            setLassoPoints([]);
            canvas.defaultCursor = 'default';
        }

        if (cropObject) canvas.remove(cropObject);
        setCropObject(null);
        setIsCropping(false);
        setCropShapeType(null);

        cropTarget.set({
            selectable: true,
            evented: true,
            opacity: 1,
        });

        setCropTarget(null);
        canvas.setActiveObject(cropTarget);
        canvas.renderAll();
    };

    // Lasso Event Handlers
    useEffect(() => {
        if (!canvas || !isCropping || cropShapeType !== 'lasso') return;

        const handleMouseDown = (opt: any) => {
            const fabricLib = (window as any).fabric;
            const pointer = canvas.getPointer(opt.e);

            // Avoid adding point if clicking 'Apply' button (simplified by assuming clicking canvas)
            // But canvas click happens. We need to check if target is canvas.
            // Fabric events usually fire on canvas. Properties panel is outside canvas.

            const points = [...lassoPoints, pointer];
            setLassoPoints(points);

            // Draw line from last point
            if (points.length > 1) {
                const start = points[points.length - 2];
                const end = points[points.length - 1];
                const line = new fabricLib.Line([start.x, start.y, end.x, end.y], {
                    stroke: 'red',
                    strokeWidth: 2,
                    selectable: false,
                    evented: false,
                    strokeDashArray: [5, 5],
                    absolutePositioned: true // Important for visual match
                    // But pointer is safe.
                });
                canvas.add(line);
                activeLassoLinesRef.current.push(line);
                canvas.renderAll();
            }
        };

        canvas.on('mouse:down', handleMouseDown);

        return () => {
            canvas.off('mouse:down', handleMouseDown);
        };
    }, [canvas, isCropping, cropShapeType, lassoPoints]);

    // History functions for undo/redo
    const saveToHistory = () => {
        if (!canvas || isUndoRedo) return;
        const json = JSON.stringify(canvas.toJSON());
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(json);
        // Keep only last 50 states
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

    // Image upload handler
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !canvas) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const fabricLib = (window as any).fabric;
            if (!fabricLib) return;

            fabricLib.Image.fromURL(event.target?.result, (img: any) => {
                // Scale image to fit canvas
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
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Add circle shape
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

    // Layer controls
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

    const bringToFront = () => {
        if (!selectedObject || !canvas) return;
        canvas.bringToFront(selectedObject);
        canvas.renderAll();
        saveToHistory();
    };

    const sendToBack = () => {
        if (!selectedObject || !canvas) return;
        canvas.sendToBack(selectedObject);
        canvas.renderAll();
        saveToHistory();
    };

    const generateLayout = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/ai/generate-layout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    productName,
                    offer,
                    format: {
                        width: formatSpec.width,
                        height: formatSpec.height,
                    },
                }),
            });

            if (!response.ok) throw new Error('Failed to generate layout');

            const data = await response.json();
            setGeneratedLayouts([data.layout]);
            setCurrentLayout(data.layout);
            setShowAIWizard(false);

            // Load layout to canvas
            if (canvas) {
                loadLayoutToCanvas(canvas, data.layout);
            }
        } catch (error) {
            console.error('Error generating layout:', error);
            alert('Failed to generate layout. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const loadLayoutToCanvas = async (fabricCanvas: any, layout: Layout) => {
        fabricCanvas.clear();
        fabricCanvas.setBackgroundColor(layout.backgroundColor || '#ffffff', () => {
            fabricCanvas.renderAll();
        });

        const fabric = (window as any).fabric;
        if (!fabric) {
            console.error('Fabric.js not loaded');
            return;
        }

        // Process elements
        for (const element of layout.elements as any[]) {
            let obj;

            if (element.type === 'text') {
                obj = new fabric.IText(element.content || 'Text', {
                    left: element.x,
                    top: element.y,
                    fill: element.fill || '#ffffff',
                    fontSize: element.fontSize || 24,
                    fontFamily: element.fontFamily || 'Inter',
                    fontWeight: element.fontWeight || 'normal',
                    charSpacing: element.charSpacing || 0,
                    textAlign: element.textAlign || 'left',
                    opacity: element.opacity || 1,
                });
                fabricCanvas.add(obj);
            } else if (element.type === 'shape') {
                obj = new fabric.Rect({
                    left: element.x,
                    top: element.y,
                    width: element.width || 100,
                    height: element.height || 100,
                    fill: element.fill || '#9333ea',
                    rx: element.borderRadius || 0,
                    ry: element.borderRadius || 0,
                });
                fabricCanvas.add(obj);
            } else if (element.type === 'image') {
                // For image elements, generate or load the image
                const imgWidth = element.width || 200;
                const imgHeight = element.height || 200;

                if (element.imagePrompt) {
                    // Generate image using AI
                    try {
                        console.log('Generating image for:', element.imagePrompt);
                        const response = await fetch('/api/ai/generate-image', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                prompt: element.imagePrompt,
                                style: element.imageStyle || 'photorealistic',
                            }),
                        });

                        const data = await response.json();

                        if (data.imageUrl) {
                            fabric.Image.fromURL(data.imageUrl, (img: any) => {
                                if (!fabricCanvas || !fabricCanvas.getContext()) return;
                                img.set({
                                    left: element.x,
                                    top: element.y,
                                    scaleX: imgWidth / (img.width || imgWidth),
                                    scaleY: imgHeight / (img.height || imgHeight),
                                });
                                fabricCanvas.add(img);
                                fabricCanvas.renderAll();
                            }, { crossOrigin: 'anonymous' });
                        }
                    } catch (error) {
                        console.error('Failed to generate image:', error);
                        // Add placeholder rectangle
                        const placeholder = new fabric.Rect({
                            left: element.x,
                            top: element.y,
                            width: imgWidth,
                            height: imgHeight,
                            fill: '#e2e8f0',
                            stroke: '#94a3b8',
                            strokeWidth: 2,
                        });
                        fabricCanvas.add(placeholder);
                    }
                } else if (element.src) {
                    // Load existing image
                    fabric.Image.fromURL(element.src, (img: any) => {
                        if (!fabricCanvas || !fabricCanvas.getContext()) return;
                        img.set({
                            left: element.x,
                            top: element.y,
                            scaleX: imgWidth / (img.width || imgWidth),
                            scaleY: imgHeight / (img.height || imgHeight),
                        });
                        fabricCanvas.add(img);
                        fabricCanvas.renderAll();
                    }, { crossOrigin: 'anonymous' });
                } else {
                    // Add placeholder
                    const placeholder = new fabric.Rect({
                        left: element.x,
                        top: element.y,
                        width: imgWidth,
                        height: imgHeight,
                        fill: '#e2e8f0',
                        stroke: '#94a3b8',
                        strokeWidth: 2,
                    });
                    fabricCanvas.add(placeholder);
                }
            }
        }

        if (fabricCanvas && fabricCanvas.getContext()) {
            fabricCanvas.renderAll();
        }
    };

    const getLayoutFromCanvas = (): Layout => {
        if (!canvas) return {
            id: 'temp',
            name: designTitle,
            width: formatSpec.width,
            height: formatSpec.height,
            elements: [],
            backgroundColor: '#ffffff'
        };

        const elements: LayoutElement[] = canvas.getObjects().map((obj: any, index: number) => {
            let type: LayoutElement['type'] = 'shape';
            if (obj.type === 'i-text' || obj.type === 'text') type = 'text';
            else if (obj.type === 'image') type = 'image';

            return {
                id: `el-${index}`,
                type,
                x: obj.left || 0,
                y: obj.top || 0,
                width: Math.round((obj.width || 0) * (obj.scaleX || 1)),
                height: Math.round((obj.height || 0) * (obj.scaleY || 1)),
                rotation: obj.angle || 0,
                opacity: obj.opacity,
                fill: typeof obj.fill === 'string' ? obj.fill : '#000000',
                content: (obj as any).text,
                fontSize: (obj as any).fontSize,
                fontFamily: (obj as any).fontFamily,
            };
        });

        return {
            id: currentLayout?.id || 'manual-layout',
            name: designTitle,
            width: formatSpec.width,
            height: formatSpec.height,
            elements,
            backgroundColor: (canvas.backgroundColor as string) || '#ffffff',
        };
    };

    const addText = () => {
        if (!canvas) {
            console.error('Canvas not ready!');
            return;
        }

        const fabricLib = (window as any).fabric;
        if (!fabricLib) {
            console.error('Fabric.js not loaded!');
            return;
        }

        // Use IText for inline editing on double-click
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
    };

    const addShape = () => {
        console.log('addShape called, canvas:', canvas);
        if (!canvas) {
            console.error('Canvas not ready!');
            return;
        }

        const fabricLib = (window as any).fabric;
        if (!fabricLib) {
            console.error('Fabric.js not loaded!');
            return;
        }

        const rect = new fabricLib.Rect({
            left: 100,
            top: 100,
            width: 200,
            height: 100,
            fill: '#9333ea',
        });

        console.log('Adding shape to canvas:', rect);
        canvas.add(rect);
        canvas.setActiveObject(rect);
        canvas.renderAll();
        console.log('Shape added successfully');
    };

    const exportAsPNG = () => {
        if (!canvas) return;

        const dataURL = canvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 2,
        });

        const link = document.createElement('a');
        link.download = `smartcanvas-design-${Date.now()}.png`;
        link.href = dataURL;
        link.click();
    };

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
                            {designId ? 'Save' : 'Save Design'}
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

            <div className="flex h-[calc(100vh-100px)]">
                {/* Toolbar */}
                <aside className="w-20 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-4 gap-2">
                    {/* AI Wizard */}
                    <button
                        onClick={() => setShowAIWizard(true)}
                        className="p-3 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800"
                        title="AI Wizard"
                    >
                        <Wand2 className="w-6 h-6" />
                    </button>

                    <div className="w-12 h-px bg-slate-200 dark:bg-slate-700 my-2" />

                    {/* Undo/Redo */}
                    <div className="flex gap-1">
                        <button
                            onClick={undo}
                            disabled={historyIndex <= 0}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 disabled:opacity-30"
                            title="Undo (Ctrl+Z)"
                        >
                            <Undo2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={redo}
                            disabled={historyIndex >= history.length - 1}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 disabled:opacity-30"
                            title="Redo (Ctrl+Y)"
                        >
                            <Redo2 className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="w-12 h-px bg-slate-200 dark:bg-slate-700 my-2" />

                    {/* Add Elements */}
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

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                </aside>

                {/* Properties Panel - shows when object is selected OR cropping mode is active */}
                {(selectedObject || isCropping) && (
                    <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 overflow-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Palette className="w-4 h-4 text-purple-600" />
                                Properties
                            </h2>
                            <button
                                onClick={() => {
                                    if (isCropping) {
                                        cancelCrop();
                                    } else {
                                        if (canvas) canvas.discardActiveObject();
                                        setSelectedObject(null);
                                        if (canvas) canvas.renderAll();
                                    }
                                }}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Crop Controls */}
                            {isCropping && (
                                <div className="p-3 bg-purple-50 border border-purple-100 rounded-lg">
                                    <h3 className="text-sm font-medium text-purple-900 mb-2">Crop Mode</h3>
                                    {cropShapeType === 'lasso' && (
                                        <p className="text-xs text-purple-700 mb-3 leading-relaxed">
                                            <strong>Draw Tool:</strong> Click points on the canvas to outline the area you want to keep. Click <strong>Apply</strong> when finished.
                                        </p>
                                    )}
                                    <div className="flex flex-col gap-2">
                                        <button onClick={applyCrop} className="w-full py-2 bg-purple-600 text-white rounded-lg flex items-center justify-center gap-2 text-sm font-medium hover:bg-purple-700">
                                            <Check className="w-4 h-4" /> Apply Crop
                                        </button>
                                        <button onClick={cancelCrop} className="w-full py-2 bg-white border border-slate-200 text-slate-700 rounded-lg flex items-center justify-center gap-2 text-sm font-medium hover:bg-slate-50">
                                            <X className="w-4 h-4" /> Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Normal Properties Logic */}
                            {!isCropping && selectedObject && (
                                <>
                                    {/* Image Tools */}
                                    {selectedObject.type === 'image' && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Image Tools</label>
                                            <div className="flex gap-2">
                                                <button onClick={() => startCrop('rect')} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center gap-2 text-xs hover:bg-slate-200 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700">
                                                    <Scissors className="w-3 h-3" /> Crop Rect
                                                </button>
                                                <button onClick={() => startCrop('circle')} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center gap-2 text-xs hover:bg-slate-200 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700">
                                                    <Circle className="w-3 h-3" /> Crop Circle
                                                </button>
                                                <button onClick={() => startCrop('lasso')} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center gap-2 text-xs hover:bg-slate-200 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700">
                                                    <PenTool className="w-3 h-3" /> Draw
                                                </button>
                                            </div>
                                        </div>
                                    )}

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
                                                className="w-10 h-10 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={objectProps.fill}
                                                onChange={(e) => updateObjectProperty('fill', e.target.value)}
                                                className="flex-1 px-2 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Font Size (for text) */}
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

                                    {/* Font Settings (Family, Spacing, Align) */}
                                    {(selectedObject.type === 'i-text' || selectedObject.type === 'text') && (
                                        <div className="space-y-4">
                                            {/* Font Family */}
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    Font Family
                                                </label>
                                                <select
                                                    value={objectProps.fontFamily}
                                                    onChange={(e) => updateObjectProperty('fontFamily', e.target.value)}
                                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                                                >
                                                    <option value="Inter">Inter (Sans)</option>
                                                    <option value="Playfair Display">Playfair Display (Luxury Serif)</option>
                                                    <option value="Cinzel">Cinzel (Elegant Caps)</option>
                                                    <option value="Arial">Arial</option>
                                                    <option value="Georgia">Georgia</option>
                                                    <option value="Times New Roman">Times New Roman</option>
                                                    <option value="Courier New">Courier New</option>
                                                    <option value="Verdana">Verdana</option>
                                                </select>
                                            </div>

                                            {/* Letter Spacing */}
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    Letter Spacing: {objectProps.charSpacing}
                                                </label>
                                                <input
                                                    type="range"
                                                    min="-50"
                                                    max="800"
                                                    step="10"
                                                    value={objectProps.charSpacing}
                                                    onChange={(e) => updateObjectProperty('charSpacing', e.target.value)}
                                                    className="w-full"
                                                />
                                            </div>

                                            {/* Alignment */}
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    Alignment
                                                </label>
                                                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                                                    {['left', 'center', 'right'].map((align) => (
                                                        <button
                                                            key={align}
                                                            onClick={() => updateObjectProperty('textAlign', align)}
                                                            className={`flex-1 py-1.5 capitalize text-xs font-medium rounded ${objectProps.textAlign === align
                                                                ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white'
                                                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                                                }`}
                                                        >
                                                            {align}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Size info - Safe access to type */}
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs">
                                        <div className="text-slate-600 dark:text-slate-400 space-y-1">
                                            <div>Type: <span className="font-medium text-slate-900 dark:text-white">{selectedObject.type}</span></div>
                                            <div>W: <span className="font-medium text-slate-900 dark:text-white">{objectProps.width}px</span> × H: <span className="font-medium text-slate-900 dark:text-white">{objectProps.height}px</span></div>
                                        </div>
                                    </div>

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
                                                className="flex items-center justify-center gap-1 px-2 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs hover:bg-slate-200 dark:hover:bg-slate-700"
                                            >
                                                <ChevronUp className="w-3 h-3" />
                                                Forward
                                            </button>
                                            <button
                                                onClick={sendBackward}
                                                className="flex items-center justify-center gap-1 px-2 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs hover:bg-slate-200 dark:hover:bg-slate-700"
                                            >
                                                <ChevronDown className="w-3 h-3" />
                                                Backward
                                            </button>
                                            <button
                                                onClick={bringToFront}
                                                className="px-2 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs hover:bg-slate-200 dark:hover:bg-slate-700"
                                            >
                                                To Front
                                            </button>
                                            <button
                                                onClick={sendToBack}
                                                className="px-2 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs hover:bg-slate-200 dark:hover:bg-slate-700"
                                            >
                                                To Back
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
                                </>
                            )}
                        </div>
                    </aside>
                )}

                {/* Canvas Area */}
                <main className="flex-1 p-8 overflow-auto flex items-center justify-center min-h-0">
                    <FabricCanvas
                        width={formatSpec.width}
                        height={formatSpec.height}
                        onCanvasReady={handleCanvasReady}
                        initialLayout={currentLayout || undefined}
                    />
                </main>

                {/* AI Wizard Sidebar */}
                {showAIWizard && (
                    <aside className="w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 overflow-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-purple-600" />
                                AI Layout Wizard
                            </h2>
                            <button
                                onClick={() => setShowAIWizard(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Campaign Description *
                                </label>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    placeholder="e.g., Summer sale banner for organic granola bars"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Product Name
                                </label>
                                <input
                                    type="text"
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    placeholder="e.g., Organic Granola Bars"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Offer / Promotion
                                </label>
                                <input
                                    type="text"
                                    value={offer}
                                    onChange={(e) => setOffer(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    placeholder="e.g., 20% OFF"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Format
                                </label>
                                <select
                                    value={format}
                                    onChange={(e) => setFormat(e.target.value as DesignFormat)}
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                >
                                    {Object.entries(FORMAT_SPECS).map(([key, spec]) => (
                                        <option key={key} value={key}>
                                            {spec.name} ({spec.width}x{spec.height})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={generateLayout}
                                disabled={!prompt || loading}
                                className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        Generate Layout
                                    </>
                                )}
                            </button>
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
}
