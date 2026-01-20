'use client';
import React, { useEffect, useState } from 'react';
import {useDispatch, useSelector} from 'react-redux';
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {Button, List, ListItem, ListItemText} from "@mui/material";
import {AppDispatch, RootState} from "@/src/store/store";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { setYearsForPlayer } from "@/src/store/slices/gameSlice";

function RoomPage() {
  const players = useSelector((state: RootState) => state.game.players);
  const dispatch = useDispatch<AppDispatch>();
  const [activePlayerIndex] = useState<number | null>(0);
  const [isMounted, setIsMounted] = useState(false);
  const [year, setYear] = useState(dayjs());

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    players.forEach((player) => {
      const randomYear = Math.floor(Math.random() * (2026 - 1900 + 1)) + 1900;
      dispatch(setYearsForPlayer({ playerId: player.id, year: randomYear }));
    });
  }, []);

  return (
    isMounted && <div>
        <Box component="section" sx={{ p: 2, maxWidth: 900, margin: '0 auto' }}>
          <Typography variant="h2" sx={{ fontSize: 24, marginBottom: 2, textAlign: 'center' }}>
            Room Page
          </Typography>
          <Typography variant="h3" sx={{ fontSize: 18, marginBottom: 2, textAlign: 'center' }}>
            Players in Room ({players.length})
          </Typography>

          <div style={{ display: 'flex', justifyContent:'space-between'}}>
            {players.length > 0 && (
              <Box sx={{ mt: 4, maxWidth: 400 }}>
                <List>
                  {players.map((player, index) => (
                    <ListItem key={player.id} disablePadding>
                      <ListItemText primary={`${index + 1}. ${player.fullName}`} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            <Box sx={{ mt: 4, minWidth: 500, padding: '50px 20px', background:'grey', borderRadius:'10px', display:'flex', gap:'20px', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
              <Button variant="contained" sx={{margin:"0 auto"}}>Random song</Button>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  views={['year']}
                  label="Year"
                  value={year}
                  onChange={(newValue) => setYear(newValue as any)}
                />
              </LocalizationProvider>
              <Button variant="contained" sx={{margin:"0 auto"}}>Agree</Button>
            </Box>
          </div>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="h2" sx={{ fontSize: 18, marginBottom: 2, textAlign: 'center' }}>
              Player
            </Typography>
            <Typography variant="h2" sx={{ fontSize: 18, marginBottom: 2, textAlign: 'center' }}>
              {
               `Name: ${players[activePlayerIndex ?? 0]?.fullName}`
              }

            </Typography>
          </Box>


          {players.length === 0 && (
            <Typography sx={{ textAlign: 'center', mt: 4, color: 'gray' }}>
              No players selected. Start a new game from the Game page.
            </Typography>
          )}
        </Box>

    </div>
  );
}

export default RoomPage;
