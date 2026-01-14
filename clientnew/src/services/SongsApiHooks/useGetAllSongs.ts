"use client";
import { useState } from "react";
import { getAllSongsAPI } from "@/src/services/songsApi";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/src/store/store";
import { getAllSongsAction } from "@/src/store/slices/songsSlice";
import {IResponseAllSongs} from "@/src/models/models";

export function useGetAllSongs() {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown>(null);

  const fetchAllSongs = async ()=>{
    setLoading(true);
    try {
      const response:IResponseAllSongs = await getAllSongsAPI();
      if(response.success) {
        dispatch(getAllSongsAction(response.data));
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  return { fetchAllSongs, loading, error };
}
