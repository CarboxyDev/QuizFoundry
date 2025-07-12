"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { AlertCircle, ExternalLink, Flag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DetailedErrorInfo {
  title: string;
  reasoning: string;
  concerns?: string[];
  confidence?: number;
}

let currentDialogData: DetailedErrorInfo | null = null;
let setDialogOpen: ((open: boolean) => void) | null = null;

function ErrorDetailsDialog() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<DetailedErrorInfo | null>(null);

  if (!setDialogOpen) {
    setDialogOpen = (openState: boolean) => {
      setOpen(openState);
      if (openState && currentDialogData) {
        setData(currentDialogData);
      }
    };
  }

  const handleReportFlag = () => {
    toast.info("Report functionality coming soon");
  };

  const handleClose = () => {
    setOpen(false);
    setData(null);
  };

  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="text-destructive h-5 w-5" />
            {data.title}
          </DialogTitle>
          <DialogDescription>
            The AI content validation system has provided detailed reasoning for
            this decision.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 border-muted rounded-lg border p-4">
            <h4 className="mb-2 text-sm font-medium">Reasoning:</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {data.reasoning}
            </p>
          </div>

          {data.concerns && data.concerns.length > 0 && (
            <div className="bg-muted/50 border-muted rounded-lg border p-4">
              <h4 className="mb-2 text-sm font-medium">Specific Concerns:</h4>
              <div className="text-muted-foreground space-y-2 text-sm">
                {data.concerns.map((concern, index) => (
                  <span key={index} className="list-item list-inside list-disc">
                    {concern}
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.confidence && (
            <div className="bg-muted/50 border-muted rounded-lg border p-4">
              <h4 className="mb-2 text-sm font-medium">Confidence Level:</h4>
              <div className="flex items-center gap-2">
                <div className="bg-muted h-2 flex-1 rounded-full">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all",
                      data.confidence >= 80
                        ? "bg-destructive"
                        : data.confidence >= 60
                          ? "bg-yellow-500"
                          : "bg-muted-foreground",
                    )}
                    style={{ width: `${data.confidence}%` }}
                  />
                </div>
                <span className="text-muted-foreground text-sm font-medium">
                  {data.confidence}%
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleReportFlag}
            disabled={true}
            className="gap-2"
          >
            <Flag className="h-4 w-4" />
            Report False Flag
          </Button>
          <Button onClick={handleClose} variant="default">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Parse error message to extract detailed information
 */
function parseErrorMessage(
  message: string,
  additionalInfo: any = null,
): DetailedErrorInfo | null {
  // Check if we have additional validation result info from the backend
  if (additionalInfo?.validationResult) {
    const validationResult = additionalInfo.validationResult;
    return {
      title: "Content Validation Failed",
      reasoning: validationResult.reasoning || message,
      concerns: validationResult.concerns || [],
      confidence: validationResult.confidence,
    };
  }

  // Check if this is a detailed error from the backend AI security check
  const rejectedMatch = message.match(
    /^Quiz content was rejected: (.+?)(?:\s+Specific concerns: (.+))?$/,
  );

  if (rejectedMatch) {
    const reasoning = rejectedMatch[1];
    const concernsString = rejectedMatch[2];
    const concerns = concernsString ? concernsString.split(", ") : [];

    return {
      title: "Content Validation Failed",
      reasoning,
      concerns: concerns.length > 0 ? concerns : undefined,
    };
  }

  // Check for other backend validation errors
  const validationPatterns = [
    /validation failed/i,
    /content rejected/i,
    /inappropriate content/i,
    /security check failed/i,
    /ai refused/i,
    /content policy violation/i,
  ];

  if (validationPatterns.some((pattern) => pattern.test(message))) {
    return {
      title: "Content Validation Error",
      reasoning: message,
    };
  }

  // Check for specific quiz creation errors that might benefit from details
  if (
    message.includes("Failed to publish quiz") ||
    message.includes("Quiz publishing failed") ||
    message.includes("Cannot publish quiz")
  ) {
    return {
      title: "Quiz Publishing Error",
      reasoning: message,
    };
  }

  // Check for other types of detailed errors
  if (
    message.includes("reasoning:") ||
    message.includes("concerns:") ||
    message.includes("confidence:") ||
    message.length > 100
  ) {
    return {
      title: "Detailed Error Information",
      reasoning: message,
    };
  }

  return null;
}

/**
 * Enhanced toast function for detailed errors
 */
export function enhancedToastError(
  error: string | Error,
  duration: number = 60000,
) {
  let message: string;
  let additionalInfo: any = null;

  if (error instanceof Error) {
    message = error.message;
    additionalInfo = {
      details: (error as any).details,
      validationResult: (error as any).validationResult,
      code: (error as any).code,
    };
  } else {
    message = error;
  }

  const details = parseErrorMessage(message, additionalInfo);

  if (details) {
    currentDialogData = details;

    return toast.error("Quiz publishing was rejected", {
      description: "The content validation system found issues with your quiz.",
      duration,
      action: {
        label: (
          <div className="flex items-center gap-1.5">
            <ExternalLink className="h-3 w-3" />
            View Details
          </div>
        ),
        onClick: () => {
          if (setDialogOpen) {
            setDialogOpen(true);
          }
        },
      },
    });
  } else {
    return toast.error(message, { duration });
  }
}

/**
 * Enhanced toast function for regular errors with longer duration
 */
export function enhancedToastErrorBasic(
  message: string,
  duration: number = 60000,
) {
  return toast.error(message, { duration });
}

export { ErrorDetailsDialog };
