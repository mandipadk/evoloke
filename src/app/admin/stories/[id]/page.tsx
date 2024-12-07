"use client";

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, GripVertical, ChevronDown, Loader2, Save, CheckCircle2, AlertCircle, Eye, EyeOff, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getStory, updateScene, createScene, deleteScene, updateSceneOrder } from '@/lib/stories';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import StoryFlow from '@/components/story-flow';
import type { Story, Scene } from '@/types/story';

interface Choice {
  id: string;
  text: string;
  nextScene: string;
}

interface SceneForm {
  id: string;
  title: string;
  content: string;
  choices: Choice[];
}

interface ValidationErrors {
  sceneId?: string;
  choices?: Record<string, string>;
}

interface SortableSceneItemProps {
  id: string;
  scene: Scene;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function Notification({ message, type = 'success', onClose }: { message: string; type?: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`
      fixed bottom-4 right-4 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg
      ${type === 'success' ? 'bg-black/90 text-white' : 'bg-red-500/90 text-white'}
      transform transition-all duration-300 animate-in slide-in-from-bottom-2
    `}>
      {type === 'success' ? (
        <CheckCircle2 className="w-5 h-5" />
      ) : (
        <AlertCircle className="w-5 h-5" />
      )}
      {message}
    </div>
  );
}

function SortableSceneItem({ id, scene, isSelected, onSelect }: SortableSceneItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg border 
        ${isSelected 
          ? 'border-blue-500 dark:border-blue-400' 
          : 'border-neutral-200 dark:border-neutral-800'
        }
        hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors
      `}
    >
      <div className="flex items-start gap-3">
        <button
          {...attributes}
          {...listeners}
          className="flex-shrink-0 p-1 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <button
          onClick={() => onSelect(id)}
          className="flex-1 text-left"
        >
          <div className="font-medium">
            {scene.title || 'Untitled Scene'}
          </div>
          <div className="mt-1 text-sm text-black/60 dark:text-white/60">
            {scene.content.substring(0, 100)}...
          </div>
          <div className="mt-2 text-xs text-black/40 dark:text-white/40 font-mono">
            {scene.id}
          </div>
        </button>
      </div>
    </div>
  );
}

function ScenePreview({ sceneId, story }: { sceneId: string; story: Story }) {
  if (!story.scenes[sceneId]) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-600 dark:text-red-400">
        Scene "{sceneId}" not found
      </div>
    );
  }

  const scene = story.scenes[sceneId];
  return (
    <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg space-y-4">
      <div className="prose prose-sm dark:prose-invert">
        <p>{scene.content}</p>
      </div>
      {scene.choices && scene.choices.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-black/60 dark:text-white/60">Choices:</h4>
          <ul className="space-y-1 text-sm">
            {scene.choices.map((choice, index) => (
              <li key={index} className="text-black/80 dark:text-white/80">
                {choice.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function StoryEditor({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [sceneForm, setSceneForm] = useState<SceneForm | null>(null);
  const [isCreatingScene, setIsCreatingScene] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [newSceneId, setNewSceneId] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [sceneOrder, setSceneOrder] = useState<string[]>([]);
  const [previewSceneId, setPreviewSceneId] = useState<string | null>(null);
  const [showVisualization, setShowVisualization] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const selectedScene = story?.scenes[selectedSceneId || ''];
  const choices = sceneForm?.choices || [];

  useEffect(() => {
    if (params.id) {
      loadStory(params.id);
    }
  }, [params.id]);

  useEffect(() => {
    if (story) {
      const orderedSceneIds = Object.keys(story.scenes);
      setSceneOrder(orderedSceneIds);
    }
  }, [story]);

  const loadStory = async (storyId: string) => {
    setIsLoading(true);
    try {
      const data = await getStory(storyId);
      if (!data) {
        setError('Story not found');
        return;
      }
      setStory(data);
      // Select the first scene by default if available
      const firstSceneId = Object.keys(data.scenes)[0];
      if (firstSceneId) {
        setSelectedSceneId(firstSceneId);
        setSceneForm({
          id: firstSceneId,
          title: data.scenes[firstSceneId].title || 'Untitled Scene',
          content: data.scenes[firstSceneId].content,
          choices: data.scenes[firstSceneId].choices || []
        });
      }
    } catch (err) {
      setError('Failed to load story');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
  };

  const handleSceneSelect = (sceneId: string) => {
    if (!story) return;
    const scene = story.scenes[sceneId];
    setSelectedSceneId(sceneId);
    const newSceneForm: SceneForm = {
      id: sceneId,
      title: scene.title || '',
      content: scene.content,
      choices: scene.choices || []
    };
    setSceneForm(newSceneForm);
  };

  const validateSceneId = (id: string): string | undefined => {
    if (!id) return 'Scene ID is required';
    if (!/^[a-z0-9-_]+$/.test(id)) return 'Scene ID can only contain lowercase letters, numbers, hyphens, and underscores';
    if (story?.scenes[id] && id !== selectedSceneId) return 'This scene ID already exists';
    return undefined;
  };

  const validateNextSceneId = (nextId: string): string | undefined => {
    if (!nextId) return 'Next scene ID is required';
    if (!story?.scenes[nextId] && nextId !== 'end') return 'This scene does not exist';
    return undefined;
  };

  const handleChoiceTextChange = (index: number, text: string) => {
    if (!sceneForm) return;
    const newChoices = [...sceneForm.choices];
    newChoices[index] = { ...newChoices[index], text };
    const updatedForm: SceneForm = {
      ...sceneForm,
      choices: newChoices
    };
    setSceneForm(updatedForm);
  };

  const handleNextSceneChange = (index: number, value: string) => {
    if (!sceneForm) return;
    const newChoices = [...sceneForm.choices];
    newChoices[index] = { ...newChoices[index], nextScene: value };
    const updatedForm: SceneForm = {
      ...sceneForm,
      choices: newChoices
    };
    setSceneForm(updatedForm);

    const error = validateNextSceneId(value);
    if (error) {
      setValidationErrors({
        ...validationErrors,
        choices: {
          ...validationErrors.choices,
          [`choice-${index}`]: error
        }
      });
    } else {
      const newChoiceErrors = { ...validationErrors.choices };
      delete newChoiceErrors[`choice-${index}`];
      setValidationErrors({
        ...validationErrors,
        choices: Object.keys(newChoiceErrors).length > 0 ? newChoiceErrors : undefined
      });
    }
  };

  const handleAddChoice = () => {
    if (!sceneForm) return;
    const newChoice: Choice = {
      id: `choice-${Date.now()}`,
      text: '',
      nextScene: ''
    };
    const updatedForm: SceneForm = {
      ...sceneForm,
      choices: [...sceneForm.choices, newChoice]
    };
    setSceneForm(updatedForm);
  };

  const handleRemoveChoice = (choiceId: string) => {
    if (!sceneForm) return;
    const updatedForm: SceneForm = {
      ...sceneForm,
      choices: sceneForm.choices.filter(choice => choice.id !== choiceId)
    };
    setSceneForm(updatedForm);
  };

  const handleContentChange = (content: string) => {
    if (!sceneForm) return;
    const updatedForm: SceneForm = {
      ...sceneForm,
      content
    };
    setSceneForm(updatedForm);
  };

  const handleSaveScene = async () => {
    if (!story || !sceneForm || !selectedSceneId) return;

    // Validate all choices
    const choiceErrors: Record<string, string> = {};
    sceneForm.choices.forEach((choice, index) => {
      const nextSceneError = validateNextSceneId(choice.nextScene);
      if (nextSceneError) {
        choiceErrors[`choice-${index}`] = nextSceneError;
      }
    });

    if (Object.keys(choiceErrors).length > 0) {
      setValidationErrors({ choices: choiceErrors });
      showNotification('Please fix the validation errors', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const updatedScene = await updateScene(story.id, selectedSceneId, {
        content: sceneForm.content,
        choices: sceneForm.choices
      });
      
      setStory({
        ...story,
        scenes: {
          ...story.scenes,
          [selectedSceneId]: updatedScene
        }
      });
      showNotification('Changes saved successfully');
      setValidationErrors({});
    } catch (err) {
      console.error(err);
      showNotification('Failed to save changes', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateScene = async () => {
    if (!story) return;

    setIsCreatingScene(true);
    setError(null);

    try {
      const newScene = await createScene(story.id, newSceneId, {
        title: `Scene ${newSceneId}`,
        content: 'Enter scene content here...',
        choices: []
      });

      const updatedStory = {
        ...story,
        scenes: {
          ...story.scenes,
          [newSceneId]: newScene
        }
      };

      setStory(updatedStory);
      setNewSceneId('');
      setIsCreatingScene(false);
      handleSceneSelect(newSceneId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create scene');
      setIsCreatingScene(false);
    }
  };

  const handleDeleteScene = async (sceneId: string) => {
    if (!story || !window.confirm('Are you sure you want to delete this scene?')) return;

    try {
      await deleteScene(story.id, sceneId);
      
      const newScenes = { ...story.scenes };
      delete newScenes[sceneId];
      
      const updatedStory = {
        ...story,
        scenes: newScenes
      };
      
      setStory(updatedStory);

      // Update scene order
      const newOrder = sceneOrder.filter(id => id !== sceneId);
      setSceneOrder(newOrder);
      await updateSceneOrder(story.id, newOrder);

      if (selectedSceneId === sceneId) {
        setSelectedSceneId(null);
        setSceneForm(null);
      }

      showNotification('Scene deleted successfully');
    } catch (err) {
      console.error(err);
      showNotification('Failed to delete scene', 'error');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSceneOrder((items) => {
        const oldIndex = items.indexOf(active.id.toString());
        const newIndex = items.indexOf(over.id.toString());
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleTitleChange = (title: string) => {
    if (!sceneForm) return;
    const updatedForm: SceneForm = {
      ...sceneForm,
      title
    };
    setSceneForm(updatedForm);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-black/60 dark:text-white/60" />
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-white dark:bg-black p-8">
        <div className="max-w-5xl mx-auto">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg">
            {error || 'Story not found'}
          </div>
          <Link 
            href="/admin/stories"
            className="mt-4 inline-flex items-center text-sm text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Stories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/admin/stories"
            className="p-2 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-4xl font-light">{story.title}</h1>
        </div>

        {/* Story Flow Visualization */}
        {showVisualization && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Story Flow</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowVisualization(false)}
                  className="p-2 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                  title="Close flow view"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <StoryFlow
              story={story}
              selectedSceneId={selectedSceneId}
              onSceneSelect={handleSceneSelect}
            />
          </div>
        )}

        <div className="flex gap-8">
          {/* Scene List */}
          <div className="w-80 shrink-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">Scenes</h2>
                <button
                  onClick={() => setShowVisualization(prev => !prev)}
                  className="inline-flex items-center gap-2 h-9 px-3 text-sm text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                >
                  {showVisualization ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Hide Flow
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Show Flow
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-2">
                <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newSceneId}
                      onChange={(e) => {
                        setNewSceneId(e.target.value.toLowerCase());
                        setValidationErrors({});
                      }}
                      placeholder="Enter new scene ID"
                      className="w-full px-3 py-2 bg-white dark:bg-black rounded-lg border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-700"
                    />
                    {validationErrors.sceneId && (
                      <p className="text-sm text-red-500">{validationErrors.sceneId}</p>
                    )}
                    <button
                      onClick={handleCreateScene}
                      disabled={isCreatingScene || !newSceneId}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-black/90 dark:hover:bg-white/90 transition-colors disabled:opacity-50"
                    >
                      {isCreatingScene ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      Create Scene
                    </button>
                  </div>
                </div>

                {/* Scene list with drag and drop */}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={sceneOrder}
                    strategy={verticalListSortingStrategy}
                  >
                    {sceneOrder.map((sceneId) => (
                      <SortableSceneItem
                        key={sceneId}
                        id={sceneId}
                        scene={story.scenes[sceneId]}
                        isSelected={selectedSceneId === sceneId}
                        onSelect={handleSceneSelect}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          </div>

          {/* Scene Editor */}
          <div className="flex-1 space-y-6">
            {selectedSceneId ? (
              <>
                <div className="p-6 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Scene Details</h3>
                    <button
                      onClick={handleSaveScene}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-black/90 dark:hover:bg-white/90 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save Changes
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-black/60 dark:text-white/60 mb-2">Scene ID</label>
                      <input
                        type="text"
                        value={selectedSceneId || ''}
                        disabled
                        className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-800 text-black/60 dark:text-white/60"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black/60 dark:text-white/60 mb-2">Title</label>
                      <input
                        type="text"
                        value={sceneForm?.title ?? ''}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-black rounded-lg border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-700"
                        placeholder="Scene title..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black/60 dark:text-white/60 mb-2">Content</label>
                      <textarea 
                        value={sceneForm?.content ?? ''}
                        onChange={(e) => handleContentChange(e.target.value)}
                        className="w-full h-32 px-3 py-2 bg-white dark:bg-black rounded-lg border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-700 resize-none"
                        placeholder="Scene content..."
                      />
                    </div>
                  </div>
                </div>
                
                {/* Choice Editor */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Choices</h3>
                    <button
                      onClick={handleAddChoice}
                      className="p-2 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {choices.map((choice: Choice, index: number) => (
                      <div 
                        key={choice.id} 
                        className="group relative p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
                      >
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 bg-neutral-200 dark:bg-neutral-800 rounded-full">
                          <span className="text-sm font-medium text-black/60 dark:text-white/60">
                            {index + 1}
                          </span>
                        </div>
                        <div className="space-y-3 pl-4">
                          <textarea
                            value={choice.text}
                            onChange={(e) => handleChoiceTextChange(index, e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-black rounded-lg border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-700"
                            placeholder="Choice text"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <select
                              value={choice.nextScene || ''}
                              onChange={(e) => handleNextSceneChange(index, e.target.value)}
                              onFocus={() => setPreviewSceneId(choice.nextScene)}
                              onBlur={() => setPreviewSceneId(null)}
                              className="flex-1 px-3 py-2 bg-white dark:bg-black rounded-lg border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-700"
                            >
                              <option value="">Select next scene</option>
                              {story && Object.entries(story.scenes).map(([id, scene]) => (
                                <option key={id} value={id}>
                                  {scene.title || 'Untitled Scene'} ({id})
                                </option>
                              ))}
                              <option value="end">END</option>
                            </select>
                            <button
                              onClick={() => handleRemoveChoice(choice.id)}
                              className="p-2 text-red-500/60 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
                              title="Delete choice"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scene Preview */}
                {previewSceneId && (
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">Preview: {previewSceneId}</h3>
                    <ScenePreview sceneId={previewSceneId} story={story} />
                  </div>
                )}

              </>
            ) : (
              <div className="h-full flex items-center justify-center text-black/40 dark:text-white/40">
                Select a scene to edit
              </div>
            )}
          </div>
        </div>
      </div>
      
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
} 