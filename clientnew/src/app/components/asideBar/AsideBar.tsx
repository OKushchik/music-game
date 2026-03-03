'use client'
import * as React from 'react';
import { useSelector } from 'react-redux';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';
import { useRouter } from "next/navigation";
import { logout } from "@/src/store/slices/authSlice";
import { clearGamePlayers } from "@/src/store/slices/gameSlice";
import {useDispatch} from "react-redux";
import {AppDispatch, RootState} from "@/src/store/store";
import {useEffect, useState} from "react";

function AsideBar() {
  const players = useSelector((state: RootState) => state.game.players);
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      dispatch(clearGamePlayers());
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleNavMenu = (page: string = "/") => {
    router.push(page);
  };

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    console.log('click')
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            LOGO
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              <MenuItem key={'home'} onClick={() => handleNavMenu('/')}>
                <Typography sx={{ textAlign: 'center' }}>Home</Typography>
              </MenuItem>
              <MenuItem key={'players'} onClick={handleCloseNavMenu}>
                <Typography sx={{ textAlign: 'center' }}>Players</Typography>
              </MenuItem>
              <MenuItem key={'ratings'} onClick={handleCloseNavMenu}>
                <Typography sx={{ textAlign: 'center' }}>Ratings</Typography>
              </MenuItem>
              <MenuItem key={'songs'} onClick={handleCloseNavMenu}>
                <Typography sx={{ textAlign: 'center' }}>Songs</Typography>
              </MenuItem>
              <MenuItem key={'createRoom'} onClick={() => handleNavMenu('/game/private-game')}>
                <Typography sx={{ textAlign: 'center' }}>CreateRoom</Typography>
              </MenuItem>
              <MenuItem key={'joinRoom'} onClick={() => handleNavMenu('/game/join')}>
                <Typography sx={{ textAlign: 'center' }}>Join</Typography>
              </MenuItem>
              {
                isMounted && players.length > 0 && (
                  <MenuItem key={'room'} onClick={() => handleNavMenu('/game/room')}>
                  <Typography sx={{ textAlign: 'center' }}>Active Room</Typography>
                </MenuItem>
                )
              }
            </Menu>
          </Box>
          <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            LOGO
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <Button
              key={'home'}
              onClick={() => handleNavMenu('/')}
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Home
            </Button>
            <Button
              key={'players'}
              onClick={handleCloseNavMenu}
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Players
            </Button>
            <Button
              key={'ratings'}
              onClick={handleCloseNavMenu}
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Ratings
            </Button>
            <Button
              key={'songs'}
              onClick={() => handleNavMenu('/songs')}
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Songs
            </Button>
            <Button
              key={'createRoom'}
              onClick={() => handleNavMenu('/private-game')}
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Create Room
            </Button>
            <Button
              key={'join'}
              onClick={() => handleNavMenu('/join')}
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Join
            </Button>
            {
              isMounted && players.length > 0 && (
                <Button key={'room'} onClick={() => handleNavMenu('/game/room')}>
                  <Typography sx={{ textAlign: 'center' }}>Active Room</Typography>
                </Button>
              )
            }
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem key={'Profile'} onClick={handleCloseUserMenu}>
                <Typography sx={{ textAlign: 'center' }}>Profile</Typography>
              </MenuItem>
              <MenuItem key={'Dashboard'} onClick={handleCloseUserMenu}>
                <Typography sx={{ textAlign: 'center' }}>Dashboard</Typography>
              </MenuItem>
              <MenuItem key={'Logout'} onClick={handleLogout}>
                <Typography sx={{ textAlign: 'center' }}>Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default AsideBar;
