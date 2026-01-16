'use client'

import * as React from 'react';
import Paper from '@mui/material/Paper';
import styles from "./page.module.css";
import {useGetAllSongs} from "@/src/services/SongsApiHooks/useGetAllSongs"
import {DataGrid, GridColDef, GridRowSelectionModel, useGridApiRef} from '@mui/x-data-grid';
import {Button} from "@mui/material";
import {useEffect, useState} from "react";
import CreateModal from "@/src/app/components/modals/CreateModal";
import {useDeleteSong} from "@/src/services/SongsApiHooks/useDeleteSong";
import {useSelector} from "react-redux";
import {RootState} from "@/src/store/store";


const paginationModel = { page: 0, pageSize: 5 };

export default function SongsPage() {
  const allSongsArray = useSelector((state: RootState) => state.songs.songs);
  const { fetchAllSongs } = useGetAllSongs();
  const { deleteSong, loading } = useDeleteSong();
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({ type: 'include', ids: new Set() });

  useEffect(() => {
    fetchAllSongs().catch((err)=>console.log(err));
  }, []);

  const columns: GridColDef[] = [
    { field: 'title', headerName: 'title', width: 130 },
    {
      field: 'year',
      headerName: 'year',
      type: 'number',
    },
    {
      field: 'link',
      headerName: 'link',
      width: 250,
    },
    {
      field: 'remove',
      headerName: 'Remove',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 130,
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="outlined"
          color="error"
          disabled = {loading}
          onClick={() => {
            deleteSong(String(params.id)).catch((err)=>console.log(err));
          }}
        >
          Remove
        </Button>
      )
    }
  ];


  return (
    <div className={styles.page}>
      <Paper sx={{height: 400, width: '100%'}}>
        <DataGrid
          rows={allSongsArray}
          columns={columns}
          initialState={{pagination: {paginationModel}}}
          pageSizeOptions={[5, 10]}
          onRowSelectionModelChange={(newRowSelectionModel) => {
            setRowSelectionModel(newRowSelectionModel);
          }}

          sx={{border: 0}}
          getRowId={(row) => row._id}

        />
      </Paper>
      <div className={styles.buttons}>
        <Button variant="contained" onClick={() => setIsOpen(true)}>Add</Button>
      </div>
      {
        isOpen && <CreateModal isOpen={isOpen} setIsOpen={setIsOpen}/>
      }
    </div>
  );
}

