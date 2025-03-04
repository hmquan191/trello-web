import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import DashboardIcon from "@mui/icons-material/Dashboard";
import VpnLockIcon from "@mui/icons-material/VpnLock";
import AddToDriveIcon from "@mui/icons-material/AddToDrive";
import BoltIcon from "@mui/icons-material/Bolt";
import FilterListIcon from "@mui/icons-material/FilterList";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import Button from "@mui/material/Button";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
// CAU HINH chung cho cac sx
const MENU_STYLES = {
  color: "primary.main",
  backgroundColor: "white",
  border: "none",
  paddingX: "5px", // chieu ngang
  borderRadius: "4px",
  "& .MuiSvgIcon-root": {
    color: "primary.main",
  },
  "&:hover": {
    backgroundColor: "primary.50",
  },
};

function BoardBar() {
  return (
    <Box
      sx={{
        width: "100%",
        height: (theme) => theme.trello.boardBarHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingX: 2,
        gap: 2,
        overflowX: "auto", // truc ngang
        borderTop: "1px solid #00bfa5", // thanh border o tren
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Chip
          sx={MENU_STYLES}
          icon={<DashboardIcon />}
          label="HMQ Stack Board"
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<VpnLockIcon />}
          label="Public/Private Workspace"
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<AddToDriveIcon />}
          label="Add to Google Drive"
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<BoltIcon />}
          label="Automation"
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<FilterListIcon />}
          label="Filters"
          clickable
        />
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Button variant="outlined" startIcon={<PersonAddIcon />}>
          Invite
        </Button>
        <AvatarGroup
          max={6}
          sx={{
            "& .MuiAvatar-root": {
              width: 34,
              height: 34,
              fontSize: 16,
            },
          }}
        >
          <Avatar alt="Karina" src="src\assets\karina.jpg" />
          <Avatar alt="Irene" src="src\assets\4_irene.jpg" />
          <Avatar alt="Seulgi" src="src\assets\6_seulgi.jpg" />
          <Avatar alt="Joy" src="src\assets\1_joy.jpg" />
          <Avatar alt="Yeri" src="src\assets\5_yeri.jpg" />
          <Avatar alt="Joy" src="src\assets\1_joy.jpg" />
          <Avatar alt="Yeri" src="src\assets\5_yeri.jpg" />
        </AvatarGroup>
      </Box>
    </Box>
  );
}

export default BoardBar;
