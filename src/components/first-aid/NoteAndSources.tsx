import { CheckCircle2 } from "lucide-react";

interface NoteAndSourcesProps {
  note?: string;
  sources?: string[];
}

export function NoteAndSources({ note, sources }: NoteAndSourcesProps) {
  return (
    <>
      {note && (
        <div className="mt-4 bg-blue-50 rounded-md p-3 flex items-start gap-2">
          <CheckCircle2 className="h-5 w-5 text-aidify-blue mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-700">{note}</p>
        </div>
      )}
      
      {sources && sources.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
          <h5 className="text-sm font-medium text-gray-700 mb-1">Sources:</h5>
          <ul className="text-xs text-gray-600 pl-5 list-disc">
            {sources.map((source, index) => (
              <li key={index}>{source}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
