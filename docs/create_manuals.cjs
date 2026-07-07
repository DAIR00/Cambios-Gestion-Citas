const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'images');
const images = {};

// Load images as base64
fs.readdirSync(imagesDir).filter(f => f.endsWith('.png')).sort().forEach(f => {
  const data = fs.readFileSync(path.join(imagesDir, f));
  images[f] = data.toString('base64');
});

function img(name) {
  return `data:image/png;base64,${images[name]}`;
}

console.log(`Loaded ${Object.keys(images).length} images`);

// Read templates
const userTemplate = fs.readFileSync(path.join(__dirname, 'template_usuario.html'), 'utf8');
const techTemplate = fs.readFileSync(path.join(__dirname, 'template_tecnico.html'), 'utf8');

// Replace image placeholders
let userHtml = userTemplate;
let techHtml = techTemplate;
for (const [name, b64] of Object.entries(images)) {
  const placeholder = `IMG:${name}`;
  const dataUrl = `data:image/png;base64,${b64}`;
  userHtml = userHtml.split(placeholder).join(dataUrl);
  techHtml = techHtml.split(placeholder).join(dataUrl);
}

fs.writeFileSync(path.join(__dirname, 'Manual_Usuario.html'), userHtml);
fs.writeFileSync(path.join(__dirname, 'Manual_Tecnico.html'), techHtml);

console.log('Manuales generados exitosamente');
