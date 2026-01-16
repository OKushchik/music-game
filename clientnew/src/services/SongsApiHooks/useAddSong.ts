"use client";
import {useState} from "react";
import {addSongAPI, getAllSongsAPI} from "@/src/services/api/songsApi";
import {useDispatch} from "react-redux";
import {AppDispatch} from "@/src/store/store";
import {addSongAction} from "@/src/store/slices/songsSlice";
import {IResponseAddSong, Song} from "@/src/models/models";

interface responseInfo {
  success: boolean,
  message?: string,
  data?: Song
}

export function useAddSong() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown>(null);
  const dispatch = useDispatch<AppDispatch>();

  const handleAdd = async (obj: Song) => {
    setLoading(true);
    try {
      const response:IResponseAddSong =  await addSongAPI(obj)

      if(response.success){
        dispatch(addSongAction(response.data));
      } else {
        setError(response.message)
      }

    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  return { addSong: handleAdd, loading, error };
}
