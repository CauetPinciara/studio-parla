import type { loadStudioData } from "@/features/app-enxuto/api";

export type AwaitedStudioData = Awaited<ReturnType<typeof loadStudioData>>;
