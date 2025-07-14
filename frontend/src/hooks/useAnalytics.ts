import {
  getCreatorAnalytics,
  getOverviewAnalytics,
  getParticipantAnalytics,
} from "@/lib/quiz-api";
import { useQuery } from "@tanstack/react-query";

export function useOverviewAnalytics() {
  return useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: getOverviewAnalytics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useCreatorAnalytics() {
  return useQuery({
    queryKey: ["analytics", "creator"],
    queryFn: getCreatorAnalytics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useParticipantAnalytics() {
  return useQuery({
    queryKey: ["analytics", "participant"],
    queryFn: getParticipantAnalytics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
