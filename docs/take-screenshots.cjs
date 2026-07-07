const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ 
    viewport: { width: 1280, height: 800 },
    locale: 'es-CO'
  });
  const page = await context.newPage();
  
  const screenshots = 'C:/Users/FORMACION/Documents/DEV/Work/gestion-citas/docs/images';

  try {
    // 1. Login page
    console.log('Capturando: Login...');
    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${screenshots}/01-login.png`, fullPage: true });

    // 2. Register page
    console.log('Capturando: Registro...');
    await page.goto('http://localhost:5173/register');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${screenshots}/02-register.png`, fullPage: true });

    // 3. Forgot password
    console.log('Capturando: Recuperar contraseña...');
    await page.goto('http://localhost:5173/recuperar');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${screenshots}/03-forgot-password.png`, fullPage: true });

    // 4. Login with validation errors
    console.log('Capturando: Login con errores...');
    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${screenshots}/04-login-errors.png`, fullPage: true });

    // 5. Login form filled
    console.log('Capturando: Login con datos...');
    await page.fill('#login-email', 'admin@sena.edu.co');
    await page.fill('#login-password', 'password123');
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${screenshots}/05-login-filled.png`, fullPage: true });

    // 6. Unauthorized page
    console.log('Capturando: No autorizado...');
    await page.goto('http://localhost:5173/unauthorized');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${screenshots}/06-unauthorized.png`, fullPage: true });

    // 7. 404 page
    console.log('Capturando: 404...');
    await page.goto('http://localhost:5173/ruta-que-no-existe');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${screenshots}/07-404.png`, fullPage: true });

    // 8. Register with roles
    console.log('Capturando: Registro con roles...');
    await page.goto('http://localhost:5173/register');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.selectOption('#reg-role', '6');
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${screenshots}/08-register-role-selected.png`, fullPage: true });

    // 9. Register as professional (shows dependency)
    console.log('Capturando: Registro profesional...');
    await page.selectOption('#reg-role', '3');
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${screenshots}/09-register-professional.png`, fullPage: true });

    console.log('¡Todas las capturas completadas!');
    console.log(`Screenshots guardados en: ${screenshots}`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
