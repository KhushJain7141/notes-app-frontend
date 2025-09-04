import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit2, Trash2, Save, X, Search } from "lucide-react";

// Types
interface Note {
  id?: number;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

// API Service
class NotesService {
  private baseUrl = "http://localhost:4000/api/notes";

  private getHeaders() {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  }

  async getAllNotes(): Promise<Note[]> {
    const response = await fetch(this.baseUrl, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch notes");
    return response.json();
  }

  async createNote(note: Omit<Note, "id">): Promise<Note> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(note),
    });
    if (!response.ok) throw new Error("Failed to create note");
    return response.json();
  }

  async updateNote(id: number, note: Note): Promise<Note> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(note),
    });
    if (!response.ok) throw new Error("Failed to update note");
    return response.json();
  }

  async deleteNote(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to delete note");
  }
}

const notesService = new NotesService();

const NotesApp: React.FC = () => {
  const navigate = useNavigate();

  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Note>({
    title: "",
    content: "",
  });

  // Redirect if no token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      loadNotes();
    }
  }, [navigate]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const fetchedNotes = await notesService.getAllNotes();
      setNotes(fetchedNotes);
      setError(null);
    } catch (err) {
      setError("Failed to load notes. Please log in again.");
      console.error("Error loading notes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    try {
      if (!formData.title.trim() || !formData.content.trim()) {
        alert("Please fill in both title and content");
        return;
      }

      const newNote = await notesService.createNote({
        title: formData.title.trim(),
        content: formData.content.trim(),
      });

      setNotes((prev) => [newNote, ...prev]);
      setFormData({ title: "", content: "" });
      setIsCreating(false);
      setSelectedNote(newNote);
    } catch (err) {
      setError("Failed to create note");
      console.error("Error creating note:", err);
    }
  };

  const handleUpdateNote = async () => {
    try {
      if (
        !selectedNote?.id ||
        !formData.title.trim() ||
        !formData.content.trim()
      ) {
        alert("Please fill in both title and content");
        return;
      }

      const updatedNote = await notesService.updateNote(selectedNote.id, {
        ...selectedNote,
        title: formData.title.trim(),
        content: formData.content.trim(),
      });

      setNotes((prev) =>
        prev.map((note) =>
          note.id === selectedNote.id ? updatedNote : note
        )
      );
      setSelectedNote(updatedNote);
      setIsEditing(false);
    } catch (err) {
      setError("Failed to update note");
      console.error("Error updating note:", err);
    }
  };

  const handleDeleteNote = async (id: number) => {
    try {
      if (!confirm("Are you sure you want to delete this note?")) return;

      await notesService.deleteNote(id);
      setNotes((prev) => prev.filter((note) => note.id !== id));

      if (selectedNote?.id === id) {
        setSelectedNote(null);
      }
    } catch (err) {
      setError("Failed to delete note");
      console.error("Error deleting note:", err);
    }
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setFormData({ title: note.title, content: note.content });
    setIsEditing(false);
    setIsCreating(false);
  };

  const startEditing = () => {
    if (selectedNote) {
      setFormData({
        title: selectedNote.title,
        content: selectedNote.content,
      });
      setIsEditing(true);
    }
  };

  const startCreating = () => {
    setFormData({ title: "", content: "" });
    setIsCreating(true);
    setIsEditing(false);
    setSelectedNote(null);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setIsCreating(false);
    if (selectedNote) {
      setFormData({
        title: selectedNote.title,
        content: selectedNote.content,
      });
    } else {
      setFormData({ title: "", content: "" });
    }
  };

  // Filter notes based on search term
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ----------------- UI -----------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading notes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16">
          <h1 className="text-xl font-bold text-gray-900">My Notes</h1>
          <button
            onClick={startCreating}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Note
          </button>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 mt-4">
          <div className="bg-red-100 border border-red-300 text-red-800 p-4 rounded">
            {error}
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notes List */}
        <div className="bg-white border rounded-lg shadow-sm">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filteredNotes.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notes found.
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedNote?.id === note.id
                      ? "bg-blue-50 border-l-4 border-l-blue-600"
                      : ""
                  }`}
                >
                  <h3 className="font-semibold text-gray-900 truncate">
                    {note.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {note.content.substring(0, 100)}...
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Editor / Viewer */}
        <div className="lg:col-span-2 bg-white border rounded-lg shadow-sm min-h-[24rem] p-6">
          {isCreating || isEditing ? (
            <>
              <h2 className="text-lg font-semibold mb-4">
                {isCreating ? "Create New Note" : "Edit Note"}
              </h2>
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full mb-3 p-2 border rounded-lg"
              />
              <textarea
                placeholder="Content"
                rows={10}
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                className="w-full mb-3 p-2 border rounded-lg"
              />
              <div className="flex gap-2">
                <button
                  onClick={isCreating ? handleCreateNote : handleUpdateNote}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </>
          ) : selectedNote ? (
            <>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold">{selectedNote.title}</h2>
                  {selectedNote.updatedAt && (
                    <p className="text-sm text-gray-500">
                      Last updated:{" "}
                      {new Date(selectedNote.updatedAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={startEditing}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      selectedNote.id && handleDeleteNote(selectedNote.id)
                    }
                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="whitespace-pre-wrap text-gray-800">
                {selectedNote.content}
              </p>
            </>
          ) : (
            <div className="text-center text-gray-500 flex flex-col items-center justify-center h-full">
              <p>No note selected. Choose one from the list or create a new one.</p>
              <button
                onClick={startCreating}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Note
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesApp;
