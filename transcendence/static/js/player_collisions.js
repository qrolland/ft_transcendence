function can_mouv_to(
	side,
	BB_borderLeft,
	BB_borderRight,
	BB_player
	) {
	if (side == "left")
	{
		return (BB_player.intersectsBox(BB_borderLeft) == false);
	}
	else if (side == "right")
	{
		return (BB_player.intersectsBox(BB_borderRight) == false);
	}
}
