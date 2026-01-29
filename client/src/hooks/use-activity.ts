import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useActivity() {
  return useQuery({
    queryKey: [api.activity.list.path],
    queryFn: async () => {
      const res = await fetch(api.activity.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch activity logs");
      return api.activity.list.responses[200].parse(await res.json());
    },
  });
}
