import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import SprintIcon from "@mui/icons-material/Flag";

import type { ProjectWithStats } from "../../types/api";

import { ProjectFormDialog } from "./ProjectFormDialog";
import ConfirmDialog from "../../components/ConfirmDialog";

import { useDeleteProject } from "../../hooks/projects/useDeleteProject";
import { colors } from "../../theme/theme";

interface ProjectCardProps {
  project: ProjectWithStats;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const deleteMutation = useDeleteProject();

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(project.id);
    setDeleteOpen(false);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on menu button
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    navigate(`/projects/${project.id}/backlog`);
  };

  return (
    <>
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          cursor: "pointer",
          transition: "all 0.2s",
          "&:hover": {
            boxShadow: 3,
            transform: "translateY(-2px)",
          },
        }}
        onClick={handleCardClick}
      >
        <CardContent
          sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
        >
          {/* Header with Key and Menu */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Chip
              label={project.key}
              size="small"
              sx={{
                bgcolor: colors.primary.main,
                color: "white",
                fontWeight: 600,
                fontSize: "0.75rem",
              }}
            />

            <IconButton
              size="small"
              aria-label={`Options for ${project.name}`}
              onClick={(event) => {
                event.stopPropagation();
                setAnchorEl(event.currentTarget);
              }}
              sx={{ ml: 1, mt: -0.5 }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Project Name */}
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            {project.name}
          </Typography>

          {/* Description */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 3,
              flexGrow: 1,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {project.description || "No description provided."}
          </Typography>

          <Divider sx={{ mb: 2 }} />

          {/* Stats */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FolderOpenIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                {project.stats.backlogCount} backlog items
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <SprintIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                {project.stats.activeSprint
                  ? `Sprint: ${project.stats.activeSprint.name}`
                  : "No active sprint"}
              </Typography>
            </Box>
          </Box>

          {/* Open Button */}
          <Button
            fullWidth
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/projects/${project.id}/backlog`);
            }}
            sx={{
              borderRadius: 1.5,
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Open Project
          </Button>
        </CardContent>
      </Card>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            setAnchorEl(null);
            setEditOpen(true);
          }}
        >
          <ListItemIcon>
            <EditOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            setAnchorEl(null);
            setDeleteOpen(true);
          }}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon>
            <DeleteOutlinedIcon fontSize="small" sx={{ color: "error.main" }} />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Edit Dialog */}
      <ProjectFormDialog
        open={editOpen}
        project={project}
        onClose={() => setEditOpen(false)}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        title="Delete project?"
        description={`Are you sure you want to delete "${project.name}"? All its todos and sprints will also be deleted. This action cannot be undone.`}
        confirmText="Delete project"
        loading={deleteMutation.isPending}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
