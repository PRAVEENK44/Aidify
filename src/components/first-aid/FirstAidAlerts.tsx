import { AlertTriangle, Clock } from "lucide-react";

interface FirstAidAlertsProps {
  warning?: string;
  estimatedTime?: string;
}

export function FirstAidAlerts({ warning, estimatedTime }: FirstAidAlertsProps) {
  return (
    <>
      {warning && (
        <div className="px-6 py-3 bg-red-50 border-b border-red-100 flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-red-800 text-sm">{warning}</p>
        </div>
      )}
      
      {estimatedTime && (
        <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex items-start gap-2">
          <Clock className="h-5 w-5 text-aidify-blue mt-0.5 flex-shrink-0" />
          <p className="text-aidify-blue text-sm">
            <span className="font-medium">Estimated treatment time:</span> {estimatedTime}
          </p>
        </div>
      )}
    </>
  );
}
