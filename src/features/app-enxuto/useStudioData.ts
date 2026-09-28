import { useQuery } from "@tanstack/react-query";
import {
  loadStudioData,
  studioDataQueryKey,
} from "@/features/app-enxuto/api";

export function useStudioData() {
  return useQuery({ queryKey: studioDataQueryKey, queryFn: loadStudioData });
}
