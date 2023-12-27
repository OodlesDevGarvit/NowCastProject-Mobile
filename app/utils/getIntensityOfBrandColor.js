export const getTextAccordingToBrandColor = (color) => {
  let red = parseInt(color?.substring(1, 3), 16);
  let green = parseInt(color?.substring(3, 5), 16);
  let blue = parseInt(color?.substring(5), 16);
  const intensity = red + green + blue;

  if (intensity > 189) {
    return '#000';
  } else {
    return '#fff';
  }
};
