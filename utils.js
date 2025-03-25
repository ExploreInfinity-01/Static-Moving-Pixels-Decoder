export function hexToRgb(hex) {
    hex = hex.replace('#', '');
  
    if (hex.length === 3) {
      hex = hex.split('').map(function (char) {
        return char + char;
      }).join('');
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
  
    return { r, g, b, string: `rgb(${r}, ${g}, ${b})`};
}

export function lerp(A, B, t) {
    return A + (B - A) * t
}