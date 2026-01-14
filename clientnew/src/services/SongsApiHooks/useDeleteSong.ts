"use client";
import { useState } from "react";
import {deleteSongAPI, getAllSongsAPI} from "@/src/services/songsApi";
import { deleteSongAction } from "@/src/store/slices/songsSlice";
import {useDispatch} from "react-redux";
import {AppDispatch} from "@/src/store/store";
import {IResponseRemoveSong} from "@/src/models/models";

export function useDeleteSong() {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown>(null);
  console.log(dispatch)

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const response:IResponseRemoveSong = await deleteSongAPI(id);
      if(response.success){
        dispatch(deleteSongAction(id));
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  return { deleteSong: handleDelete, loading, error };
}
