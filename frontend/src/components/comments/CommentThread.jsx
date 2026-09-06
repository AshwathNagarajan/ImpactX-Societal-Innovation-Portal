import { useEffect, useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { commentService } from "../../services/commentService.js";
import { apiErrorMessage } from "../../utils/apiError.js";
import { useToast } from "../common/ToastProvider.jsx";

export default function CommentThread({ entityType, entityId, title = "Discussion" }) {
  const [comments, setComments] = useState([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { showToast } = useToast();

  const loadComments = async () => {
    if (!entityType || !entityId) return;
    try {
      const res = await commentService.list(entityType, entityId);
      setComments(res.items || []);
    } catch (err) {
      setError(apiErrorMessage(err, "Unable to load discussion."));
    }
  };

  useEffect(() => {
    loadComments();
  }, [entityType, entityId]);

  const submit = async (event) => {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    setBusy(true);
    setError("");
    try {
      const res = await commentService.create({ entity_type: entityType, entity_id: entityId, body: trimmed });
      setComments((items) => [...items, res.data]);
      setBody("");
      showToast("Comment added.");
    } catch (err) {
      const text = apiErrorMessage(err, "Unable to add comment.");
      setError(text);
      showToast(text, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm md:p-8">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue">
          <MessageSquare size={20} />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-navy md:text-xl">{title}</h2>
          <p className="text-sm text-slate-500">Shared notes between authorized workspace users.</p>
        </div>
      </div>
      {error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">{error}</p>}
      <div className="mt-6 space-y-4">
        {comments.map((comment) => (
          <article key={comment.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <span>{comment.author?.name || "User"}</span>
              <span>|</span>
              <span>{comment.author?.role || "workspace"}</span>
              {comment.created_at && <span>{new Date(comment.created_at).toLocaleString()}</span>}
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-700">{comment.body}</p>
          </article>
        ))}
        {!comments.length && <p className="rounded-2xl border border-dashed bg-slate-50 p-5 text-sm font-semibold text-slate-500">No discussion yet.</p>}
      </div>
      <form onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={body}
          onChange={(event) => setBody(event.target.value)}
          className="min-h-12 min-w-0 flex-1 rounded-xl border px-4 py-3 text-sm outline-none focus:border-blue"
          placeholder="Add a workflow note"
        />
        <button disabled={busy} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
          <Send size={16} /> {busy ? "Sending" : "Send"}
        </button>
      </form>
    </section>
  );
}
