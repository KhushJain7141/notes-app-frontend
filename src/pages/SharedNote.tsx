import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const SharedNote = () => {
  const { shareId } = useParams();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/notes/public/${shareId}`
        );
        if (!res.ok) throw new Error("Note not found");
        const data = await res.json();
        setNote(data);
      } catch (err: any) {
        setError(err.message || "Failed to load note");
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading note...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Note not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-6 flex justify-between items-center h-16">
          <h1 className="text-xl font-bold text-gray-900">Shared Note</h1>
          <Link
            to="/note"
            className="bg-primary hover:bg-meta text-white px-4 py-2 rounded-lg"
          >
            Back to My Notes
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white border rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{note.title}</h2>
          <p className="whitespace-pre-wrap text-gray-800">{note.content}</p>
          <p className="text-sm text-gray-500 mt-6">
            Last updated: {new Date(note.updatedAt).toLocaleString()}
          </p>
        </div>
      </main>
    </div>
  );
};

export default SharedNote;
