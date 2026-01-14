import {$host} from "../index";
import {Song} from "@/src/models/models";

export const getAllSongsAPI = async () => {
  const {data} = await $host.get('api/songs/get')
  return data
}

export const addSongAPI = async (obj: Song) => {
  const {data} = await $host.post('api/songs/add', {
    ...obj
  })
  return data
}


export const deleteSongAPI = async (id: string) => {
  const {data} = await $host.delete(`api/songs/delete/${id}`)
  return data
}

export const deleteManySongsAPI = async (ids: string[]) => {
  const {data} = await $host.delete(`api/songs/delete-many`, {
    data: { ids },
  })
  return data
}
