import { cn } from "@/lib/utils";
import { Step } from "@/types/firstAid";
import { Clock } from "lucide-react";

interface StepsListProps {
  steps: Step[];
  currentStepIndex: number;
  setCurrentStepIndex: (index: number) => void;
}

export function StepsList({ steps, currentStepIndex, setCurrentStepIndex }: StepsListProps) {
  return (
    <ol className="space-y-3 list-none pl-0">
      {steps.map((step, index) => (
        <li 
          key={step.id} 
          className={cn(
            "flex items-start gap-3 pb-3",
            index !== steps.length - 1 && "border-b",
            currentStepIndex === index && "bg-blue-50 -mx-2 px-2 py-1 rounded"
          )}
          onClick={() => setCurrentStepIndex(index)}
        >
          <div className={cn(
            "bg-blue-50 text-aidify-blue rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5",
            step.important && "bg-red-50 text-red-600"
          )}>
            {step.id}
          </div>
          <div className="flex flex-col w-full">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-gray-700">
                  Step {step.id}
                  {step.important && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                      Critical
                    </span>
                  )}
                </h3>
              </div>
              {step.duration && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {step.duration}
                </span>
              )}
            </div>
            <div className={cn(
              "text-gray-700",
              step.important && "font-medium text-red-600"
            )}>
              {step.content}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
