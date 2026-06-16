import { api } from "../api";
import type { ApiResponse } from "@/types";

export const dashboardApi = {
  get: () =>
    api.get<ApiResponse<any>>("/dashboard").then((r) => {
      const payload = r.data ?? r;
      if (payload?.latestResume) {
        payload.latestResume.id = payload.latestResume.id ?? payload.latestResume._id;
        payload.latestResume._id = payload.latestResume.id ?? payload.latestResume._id;
      }
      return payload;
    }),
};
