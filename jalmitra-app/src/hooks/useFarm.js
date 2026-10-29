import { useCallback, useEffect, useState } from "react";
import { apiGet } from "../services/api";

export const useFarm = () => {
  const [farm, setFarm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFarm = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiGet("/farm");
      setFarm(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFarm();
  }, [fetchFarm]);

  return {
    farm,
    loading,
    error,
    refresh: fetchFarm,
  };
};
