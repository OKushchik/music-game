import React, {useEffect} from "react";
import { useDispatch } from "react-redux";
import {
  Button, Checkbox, FormControl,
  IconButton,
  Input,
  InputAdornment, InputLabel,
  List,
  ListItem, ListItemAvatar, ListItemButton, ListItemText, Select,
} from "@mui/material";
import { SelectChangeEvent } from '@mui/material/Select';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import ClearIcon from '@mui/icons-material/Clear';
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import { useGetAllUsers } from "@/src/services/apiHooks";
import { User } from "@/src/models/models";
import {addTrackId, initYearForPlayer, setGamePlayers} from "@/src/store/slices/gameSlice";
import {useRouter} from "next/navigation";
import MenuItem from "@mui/material/MenuItem";

type CustomPlayer = {
  id: string;
  fullName: string;
};

type CheckedPlayer = {
  id: string;
  fullName: string;
  years?: string[]; // allow optional years locally
};

export const NewGameModal: React.FC =() => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [checkedUsers, setCheckedUsers] = React.useState<CheckedPlayer[]>([]);
  const [isShowAddCustomPlayer, setIsShowAddCustomPlayer] = React.useState<boolean>(false);
  const [customPlayerName, setCustomPlayerName] = React.useState<string>('');
  const [trackId, setTrackId] = React.useState<string>('6tAdMSXECJTIWWP4GVpn83');

  const { data, loading, error } = useGetAllUsers();

  useEffect(() => {
    dispatch(addTrackId(trackId));
  }, [trackId]);

  const handleToggle = (userId: string, fullName: string) => () => {
    setCheckedUsers(prev =>
      prev.some(u => u.id === userId)
        ? prev.filter(u => u.id !== userId)
        : [...prev, { id: userId, fullName, years: [] }]
    );
  };

  const handleRemovePlayer = (playerId: string) => {
    setCheckedUsers(prev => prev.filter(u => u.id !== playerId));
  };

  const setNewPlayer = (nickname: string) => {
    if (!nickname.trim()) {
      alert('Please enter a player name');
      return;
    }
    const newUser:CustomPlayer = {
      id: `${Date.now()}`,
      fullName: nickname,
    }
    setCheckedUsers(prev => [...prev, { id: newUser.id, fullName: newUser.fullName, years: [] }]);
    setCustomPlayerName('');
    setIsShowAddCustomPlayer(false);
  }

  const handleStartGame = () => {
    if (checkedUsers.length === 0) {
      alert('Please select at least one player');
      return;
    }
    dispatch(setGamePlayers(checkedUsers));
    router.push("/game/room");
  }

  const choseTrackList = (event: SelectChangeEvent<string>) => {
    const value = event.target.value as string;
    setTrackId(value);
  }

  return (
    <div>
      <Box component="section"
           sx={{
             p: 2,
             border: '1px dashed grey',
             maxWidth: 400,
             margin: '50px auto' }}>
        <Typography variant="h2" sx={{ fontSize: 24, marginBottom: 2, textAlign: 'center' }}>
          Start game
        </Typography>
        <Typography variant="h3" sx={{ fontSize: 18, marginBottom: 2, textAlign: 'center' }}>
          Users
        </Typography>
        <List dense sx={{
          marginTop: 2,
          width: '100%',
          maxWidth: 360,
          bgcolor: 'background.paper',
          maxHeight: 200,
          overflow: 'auto',
          '& ul': { padding: 0 },
        }}>
          {loading && <Typography>Loading...</Typography>}
          {error && <Typography>Error loading users</Typography>}
          {data?.map((user: User, index) => {
            const userId = user.id || user._id || `tmp-${index}`;
            const labelId = `checkbox-list-secondary-label-${userId}`;
            const isChecked = checkedUsers.some(u => u.id === userId);
            return (
              <ListItem
                key={userId!}
                secondaryAction={
                  <Checkbox
                    edge="end"
                    onChange={handleToggle(userId as string, user.fullName)}
                    checked={isChecked}
                  />
                }
                disablePadding
              >
                <ListItemButton>
                  <ListItemAvatar>
                    <Avatar
                      alt={user.fullName}
                      src={user.avatarUrl || '/static/images/avatar/default.jpg'}
                    />
                  </ListItemAvatar>
                  <ListItemText id={labelId} primary={user.fullName} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
        {
          isShowAddCustomPlayer &&
          <Input
            id="standard-basic"
            type="text"
            placeholder="Enter player name"
            value={customPlayerName}
            onChange={(e) => setCustomPlayerName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setNewPlayer(customPlayerName)}
            sx={{marginTop: 2, width: '100%'}}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={()=>setNewPlayer(customPlayerName)}
                  edge="end"
                >
                  <DoneOutlineIcon sx={{width:"30px", height:"30px", padding:'5px'}}/>
                </IconButton>
              </InputAdornment>
            }
          />
        }

        <Button type="button" onClick={() => setIsShowAddCustomPlayer(prev => !prev)} sx={{marginTop: 2}}>
          + Add custom player
        </Button>
        <Typography variant="h3" sx={{ fontSize: 18, marginBottom: 2, marginTop: 2, textAlign: 'center' }}>
          Players
        </Typography>

        <List>
          {
            checkedUsers.map((player, index) => (
              <ListItem
                key={player.id}
                component="div"
                disablePadding
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={() => handleRemovePlayer(player.id)}
                  >
                    <ClearIcon />
                  </IconButton>
                }
              >
                <ListItemText primary={`${index+1}) ${player.fullName}`} />
              </ListItem>
            ))
          }
        </List>

        <Box>
          <Typography variant="h3" sx={{ fontSize: 18, marginBottom: 2, textAlign: 'center' }}>
            Select playlist
          </Typography>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="track-list">Select playlist</InputLabel>
            <Select
              size={"medium"}
              labelId="track-list"
              id="select-track-list"
              value={trackId}
              label="Select playlist"
              onChange={(e)=>choseTrackList(e)}
            >
              <MenuItem value={'6tAdMSXECJTIWWP4GVpn83'}>Top 100 Al times</MenuItem>
              <MenuItem value={'1InkWO5fnA7rMZJXCc6s7S'}>Ukrainian Songs</MenuItem>
              <MenuItem value={'5ABHKGoOzxkaa28ttQV9sE'}>Top most streamed</MenuItem>
              <MenuItem value={'4WsA2wYoXFkXaha0VofrPd'}>Top 90's</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Button
          type="submit"
          onClick={handleStartGame}
          disabled={checkedUsers.length === 0}
          sx={{marginTop: 2}}
        >
          Start Game
        </Button>

      </Box>
    </div>
  );
}
