import { useEffect, useState } from "react";
import type {IResponseAllUsers, User} from "@/src/models/models";
import { getAllUsers } from "../api/authApi";

export type UseGetAllUsersResult = {
  data: User[] | null;
  loading: boolean;
  error: Error | null;
};

export function useGetAllUsers(): UseGetAllUsersResult {
  const [data, setData] = useState<User[] | null>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getAllUsers();
        setData(res.data);
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)));
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { data, loading, error };
}
