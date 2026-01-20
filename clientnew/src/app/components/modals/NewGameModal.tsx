import React from "react";
import { useDispatch } from "react-redux";
import {
  Button, Checkbox,
  IconButton,
  Input,
  InputAdornment,
  List,
  ListItem, ListItemAvatar, ListItemButton, ListItemText,
} from "@mui/material";
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import ClearIcon from '@mui/icons-material/Clear';
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import { useGetAllUsers } from "@/src/services/apiHooks";
import { User } from "@/src/models/models";
import { setGamePlayers } from "@/src/store/slices/gameSlice";
import {useRouter} from "next/navigation";

type CustomPlayer = {
  id: string;
  fullName: string;
};

type CheckedPlayer = {
  id: string;
  fullName: string;
};

export const NewGameModal: React.FC =() => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [checkedUsers, setCheckedUsers] = React.useState<CheckedPlayer[]>([]);
  const [isShowAddCustomPlayer, setIsShowAddCustomPlayer] = React.useState<boolean>(false);
  const [customPlayerName, setCustomPlayerName] = React.useState<string>('');
  const { data, loading, error } = useGetAllUsers();

  const handleToggle = (userId: string, fullName: string) => () => {
    setCheckedUsers(prev =>
      prev.some(u => u.id === userId)
        ? prev.filter(u => u.id !== userId)
        : [...prev, { id: userId, fullName }]
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
    setCheckedUsers(prev => [...prev, { id: newUser.id, fullName: newUser.fullName }]);
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
    console.log('Game started with players:', checkedUsers);



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
