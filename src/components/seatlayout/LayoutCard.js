import React, { useState } from 'react';
import {
    Card, CardContent, Avatar, Box, Typography, Divider, IconButton, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, CircularProgress
} from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';

const LayoutCard = ({ layout, onEdit, onDelete }) => {
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            await onDelete(layout.id); // Chama a função de exclusão
            setConfirmDeleteOpen(false);
        } catch (err) {
            console.error("Erro ao excluir layout:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Card
                onClick={onEdit}
                sx={{
                    cursor: 'pointer',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    position: 'relative',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': { transform: 'scale(1.02)', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)' },
                    mb: 2,
                    borderRadius: 2,
                }}
            >
                <CardContent sx={{ padding: '8px !important' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ bgcolor: 'primary.main', mr: 1, width: 28, height: 28 }}>
                                <DirectionsBusIcon fontSize="small" />
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                   {layout.name || 'Sem nome'}
                                </Typography> {/* Nome do layout */}
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                    ID: {layout.id}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Criado em: {new Date(layout.dataAdicionado).toLocaleDateString()}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Tooltip title="Editar">
                                <IconButton size="small" edge="end" aria-label="edit" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Excluir">
                                <IconButton size="small" edge="end" aria-label="delete" onClick={(e) => { e.stopPropagation(); setConfirmDeleteOpen(true); }}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                    <Divider sx={{ mb: 1 }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <EventSeatIcon fontSize="small" />
                            <Typography variant="caption">Assentos Totais: {layout.assentosTotais}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <DoubleArrowIcon fontSize="small" />
                            <Typography variant="caption">Dois Andares: {layout.doisAndares ? 'Sim' : 'Não'}</Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Diálogo para confirmação de exclusão */}
            <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Tem certeza que deseja excluir o layout selecionado? Esta ação não pode ser desfeita.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDeleteOpen(false)} variant="contained" color="cancelled" sx={{ borderRadius: '50px' }}>
                        Voltar
                    </Button>
                    <Button onClick={handleDelete} variant="contained" color="error" sx={{ color: 'white', borderRadius: '50px' }}>
                        {loading ? <CircularProgress size={24} /> : 'Excluir'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default LayoutCard;
