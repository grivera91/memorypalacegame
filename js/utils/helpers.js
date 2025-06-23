export const Helpers = {
  shuffleArray(array) {
    Phaser.Utils.Array.Shuffle(array);
    return array;
  },
  
  // Reposiciona y reescala elementos de forma responsiva
  applyResponsiveLayout(scene, elements, baseWidth = 1280, baseHeight = 720) {
    const width = scene.scale.width;
    const height = scene.scale.height;

    const scaleRatioX = width / baseWidth;
    const scaleRatioY = height / baseHeight;
    const scaleRatio = Math.min(scaleRatioX, scaleRatioY);

    elements.forEach(el => {
      if (el.type === 'text') {
        el.object.setFontSize(el.baseFontSize * scaleRatio);
        el.object.setPosition(width * el.x, height * el.y);
      }

      if (el.type === 'image' || el.type === 'button') {
        el.object.setPosition(width * el.x, height * el.y);
        if (el.baseScale) el.object.setScale(el.baseScale * scaleRatio);
      }
    });
  }
};