import React, {useState} from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField} from "@mui/material";
import {useAddSong} from "@/src/services/SongsApiHooks/useAddSong";
import {Song} from "@/src/models/models";

interface CreateModalProps {
  isOpen: boolean;
  setIsOpen: (arg: boolean)=>void;
}


const CreateModal: React.FC<CreateModalProps> =({isOpen, setIsOpen}) => {
  const {addSong} = useAddSong()
  const [formData, setFormData] = useState<Song>({
    title:'',
    year: 1990,
    link:''
  })

  function submitForm(e: React.FormEvent) {
    e.preventDefault()
    console.log(formData)
    addSong(formData).then(()=>{
      setFormData({
        title:'',
        year: 1990,
        link:''
      })
    })

    setIsOpen(false)
  }
  return (
    <Dialog open={isOpen} onClose={()=>setIsOpen(false)}>
      <DialogTitle>Song information</DialogTitle>
      <DialogContent sx={{ paddingBottom: 0 }}>
        <form onSubmit={submitForm}>
          <TextField
            value={formData.title}
            onChange={(event) => {
              setFormData((prev) => ({
                ...prev,
                title: event.target.value
              }));
            }}
            autoFocus
            required
            margin="dense"
            id="title"
            name="title"
            label="Song Title"
            type="text"
            fullWidth
            variant="standard"
          />
          <TextField
            value={formData.year}
            onChange={(event) => {
              setFormData((prev) => ({
                ...prev,
                year: Number(event.target.value)
              }));
            }}
            autoFocus
            required
            margin="dense"
            id="year"
            name="year"
            label="Year"
            type="number"
            fullWidth
            variant="standard"
          />
          <TextField
            onChange={(event) => {
              setFormData((prev) => ({
                ...prev,
                link: event.target.value
              }));
            }}
            value={formData.link}
            autoFocus
            required
            margin="dense"
            id="link"
            name="link"
            label="Link"
            type="text"
            fullWidth
            variant="standard"
          />
          <DialogActions>
            <Button onClick={()=>setIsOpen(false)}>Cancel</Button>
            <Button type="submit">Add</Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateModal;
