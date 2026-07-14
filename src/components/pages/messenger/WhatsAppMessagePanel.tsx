import { useState } from "react";
import { X, MessageSquare, Send, CheckCircle2 } from "lucide-react";

export function WhatsAppMessagePanel({
  title,
  variables,
  recipients,
  previewText,
  onSend,
  onClose,
}: {
  title: string;
  variables: readonly string[];
  recipients: { id: string; name: string }[];
  previewText: string;
  onSend: () => void;
  onClose: () => void;
}) {
  const [sendSuccess, setSendSuccess] = useState(false);

  function handleSend() {
    onSend();
    setSendSuccess(true);
    setTimeout(() => setSendSuccess(false), 2500);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-green-50">
        <div className="flex items-center gap-2">
          <MessageSquare size={15} className="text-green-600" />
          <h3 className="text-sm font-semibold text-green-800">{title}</h3>
        </div>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={15} />
        </button>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest block mb-2">
            Message Template
          </label>
          <div className="bg-[#e9f5e1] border border-green-200 rounded-xl px-4 py-3 text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
            {previewText}
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5">
            Variables:{" "}
            {variables.map((v) => (
              <code key={v} className="bg-gray-100 px-1 rounded mr-1">
                {v}
              </code>
            ))}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">
            Edit templates in <span className="font-semibold text-gray-500">Settings → Sales → Message Templates</span>
          </p>
        </div>

        <div>
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-2">
            Recipients ({recipients.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {recipients.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1 text-xs text-gray-600"
              >
                <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-[8px] font-bold text-white">
                  {c.name[0]}
                </div>
                {c.name.split(" ")[0]}
              </div>
            ))}
          </div>
        </div>

        {sendSuccess && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-semibold">
            <CheckCircle2 size={16} /> Messages queued for {recipients.length} recipients via WhatsApp!
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSend}
            disabled={recipients.length === 0}
            className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-40"
          >
            <Send size={14} /> Send to All
          </button>
          <p className="text-[10px] text-gray-400">Queued to outbox — connect VITE_USE_API for Cloud API</p>
        </div>
      </div>
    </div>
  );
}
