// Texture creation functions
export function createCabFrontTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    context.fillStyle = '#0066ff'; // Bright blue cab
    context.fillRect(0, 0, 256, 256);
    context.fillStyle = '#000000'; // Grill
    context.fillRect(50, 120, 156, 60);
    context.fillStyle = '#aaddff'; // Windshield
    context.fillRect(50, 40, 156, 50);
    return new THREE.CanvasTexture(canvas);
}

export function createCabSideTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    context.fillStyle = '#0066ff';
    context.fillRect(0, 0, 256, 256);
    context.strokeStyle = '#ffffff'; // Door outline
    context.lineWidth = 5;
    context.strokeRect(60, 60, 136, 136);
    return new THREE.CanvasTexture(canvas);
}

export function createPlainTexture(color) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    context.fillStyle = color;
    context.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(canvas);
}

export function createTrailerSideTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, 512, 256);
    context.fillStyle = '#ff0000';
    context.font = 'bold 60px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('FREIGHT FRENZY', 256, 128);
    context.fillStyle = '#ffff00';
    context.beginPath();
    context.arc(100, 50, 20, 0, Math.PI * 2);
    context.arc(412, 206, 20, 0, Math.PI * 2);
    context.fill();
    return new THREE.CanvasTexture(canvas);
}

export function createTrailerBackTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, 256, 256);
    context.fillStyle = '#dddddd';
    context.fillRect(10, 10, 118, 236);
    context.fillRect(128, 10, 118, 236);
    context.fillStyle = '#ff0000';
    context.fillRect(118, 128, 20, 20);
    return new THREE.CanvasTexture(canvas);
}

export function createTreadTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    context.fillStyle = '#111111';
    context.fillRect(0, 0, 256, 256);
    context.strokeStyle = '#333333';
    context.lineWidth = 8;
    for (let i = 0; i < 256; i += 20) {
        context.beginPath();
        context.moveTo(0, i);
        context.lineTo(256, i);
        context.stroke();
    }
    return new THREE.CanvasTexture(canvas);
}

export function createRimTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    context.fillStyle = '#aaaaaa';
    context.fillRect(0, 0, 256, 256);
    context.fillStyle = '#555555';
    for (let angle = 0; angle < 360; angle += 60) {
        const rad = angle * Math.PI / 180;
        const x = 128 + 100 * Math.cos(rad);
        const y = 128 + 100 * Math.sin(rad);
        context.beginPath();
        context.arc(x, y, 15, 0, Math.PI * 2);
        context.fill();
    }
    return new THREE.CanvasTexture(canvas);
}

export function createAsphaltTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    
    // Base dark gray
    context.fillStyle = '#333333';
    context.fillRect(0, 0, 512, 512);
    
    // Add asphalt texture
    for (let i = 0; i < 5000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = Math.random() * 3;
        const grayValue = Math.floor(20 + Math.random() * 40);
        const color = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
        
        context.fillStyle = color;
        context.beginPath();
        context.arc(x, y, size, 0, Math.PI * 2);
        context.fill();
    }
    
    // Add cracks and imperfections
    for (let i = 0; i < 20; i++) {
        const x1 = Math.random() * 512;
        const y1 = Math.random() * 512;
        const x2 = x1 + (Math.random() - 0.5) * 100;
        const y2 = y1 + (Math.random() - 0.5) * 100;
        
        context.strokeStyle = '#222222';
        context.lineWidth = 1 + Math.random() * 2;
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
    }
    
    return new THREE.CanvasTexture(canvas);
}

export function createZapsTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');

    // White background
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, 256, 256);

    // Draw the main circular puck shape 
    context.fillStyle = '#FFFFFF';
    
    // Outer ring (white edge)
    context.beginPath();
    context.arc(128, 128, 110, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = '#000000';
    context.lineWidth = 2;
    context.stroke();
    
    // Inner green circular area
    context.beginPath();
    context.arc(128, 128, 90, 0, Math.PI * 2);
    context.fillStyle = '#005C38'; // Dark green like ZYN
    context.fill();
    
    // Green ring around the inner circle
    context.beginPath();
    context.arc(128, 128, 100, 0, Math.PI * 2);
    context.strokeStyle = '#00AA4F'; // Brighter green ring
    context.lineWidth = 4;
    context.stroke();

    // Add "ZAPS" text in large white letters
    context.font = 'bold 50px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#FFFFFF';
    context.fillText('ZAPS', 128, 110);
    
    // Add "WINTERGREEN" text below
    context.font = 'bold 16px Arial';
    context.fillStyle = '#FFFFFF';
    context.fillText('WINTERGREEN', 128, 150);
    
    // Add "6" with "MG" in the bottom right
    context.font = 'bold 30px Arial';
    context.fillText('6', 180, 128);
    context.font = 'bold 12px Arial';
    context.fillText('MG', 180, 145);

    return new THREE.CanvasTexture(canvas);
}

export function createEnergyTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    
    // Clear background
    context.fillStyle = 'rgba(0, 0, 0, 0)';
    context.fillRect(0, 0, 256, 256);
    
    // Draw energy drink can
    context.fillStyle = '#222222';  // Dark base color
    context.strokeStyle = '#111111';
    context.lineWidth = 3;
    
    // Main can body
    context.beginPath();
    context.rect(88, 50, 80, 170);
    context.fill();
    context.stroke();
    
    // Can top
    context.beginPath();
    context.ellipse(128, 50, 40, 12, 0, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    
    // Can bottom
    context.beginPath();
    context.ellipse(128, 220, 40, 12, 0, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    
    // Add neon green design elements
    context.fillStyle = '#00FF00';  // Bright neon green
    
    // Electric design pattern
    for (let i = 0; i < 6; i++) {
        context.beginPath();
        context.moveTo(88, 70 + i * 25);
        context.lineTo(105, 80 + i * 25);
        context.lineTo(88, 90 + i * 25);
        context.lineTo(105, 100 + i * 25);
        context.lineTo(168, 80 + i * 25);
        context.lineTo(130, 90 + i * 25);
        context.lineTo(168, 100 + i * 25);
        context.closePath();
        context.fill();
    }
    
    // Add "ENERGY" text
    context.font = 'bold 25px Arial';
    context.fillStyle = '#FFFFFF';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('ENERGY', 128, 128);
    
    // Add "+SPEED" text
    context.font = 'bold 20px Arial';
    context.fillStyle = '#00FF00';
    context.fillText('+SPEED', 128, 158);
    
    // Add a pull-tab at the top
    context.fillStyle = '#DDDDDD';
    context.beginPath();
    context.rect(118, 38, 20, 8);
    context.fill();
    context.stroke();
    
    // Add a highlight
    context.fillStyle = 'rgba(0, 255, 0, 0.3)';
    context.beginPath();
    context.rect(93, 50, 15, 170);
    context.fill();
    
    return new THREE.CanvasTexture(canvas);
}

export function createWrenchTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    
    // Clear background
    context.fillStyle = 'rgba(0, 0, 0, 0)';
    context.fillRect(0, 0, 256, 256);
    
    // Set bright chrome/silver color for the wrench with high contrast against asphalt
    const mainColor = '#E0E8F0'; // Bright silver/chrome
    const outlineColor = '#2B4C7E'; // Dark blue outline for contrast
    const highlightColor = '#FFFFFF'; // White highlight for metallic effect
    const shadowColor = '#0A2463'; // Deep blue shadow
    
    context.lineWidth = 4;
    context.strokeStyle = outlineColor;
    
    // Create a more realistic wrench shape - combination wrench with open-end and box-end
    
    // Start with a gradient fill for metallic look - reduced brightness
    const gradient = context.createLinearGradient(100, 0, 160, 256);
    gradient.addColorStop(0, mainColor);
    gradient.addColorStop(0.3, '#F0F0F0');  // Toned down highlight
    gradient.addColorStop(0.5, mainColor);
    gradient.addColorStop(0.7, shadowColor);
    gradient.addColorStop(1, mainColor);
    context.fillStyle = gradient;
    
    // Draw wrench handle with slight curve
    context.beginPath();
    context.moveTo(118, 85);  // Top of handle, just below open-end
    context.bezierCurveTo(110, 145, 110, 180, 115, 200); // Left curve of handle
    context.lineTo(140, 200); // Bottom width of handle
    context.bezierCurveTo(145, 180, 145, 145, 137, 85); // Right curve of handle
    context.closePath();
    context.fill();
    context.stroke();
    
    // Draw the open-end head (top of wrench)
    context.beginPath();
    // Left outside of open-end
    context.moveTo(118, 85);
    context.bezierCurveTo(100, 70, 85, 60, 90, 40);
    context.lineTo(105, 30);
    // Inside of open-end
    context.lineTo(115, 45);
    context.lineTo(140, 45);
    // Right outside of open-end
    context.lineTo(150, 30);
    context.bezierCurveTo(165, 60, 150, 70, 137, 85);
    context.closePath();
    context.fill();
    context.stroke();
    
    // Draw the box-end (bottom of wrench)
    context.beginPath();
    // Connect from the handle
    context.moveTo(115, 200);
    context.bezierCurveTo(110, 220, 105, 225, 100, 235);
    // Draw the box hexagon shape
    context.lineTo(105, 250);
    context.lineTo(150, 250);
    context.lineTo(155, 235);
    context.bezierCurveTo(150, 225, 145, 220, 140, 200);
    context.closePath();
    context.fill();
    context.stroke();
    
    // Add inner hexagon cutout in the box-end
    context.fillStyle = 'rgba(0, 0, 0, 0)';
    context.globalCompositeOperation = 'destination-out';
    context.beginPath();
    context.moveTo(119, 232);
    context.lineTo(119, 243);
    context.lineTo(127, 248);
    context.lineTo(137, 243);
    context.lineTo(137, 232);
    context.lineTo(127, 227);
    context.closePath();
    context.fill();
    context.globalCompositeOperation = 'source-over';
    
    // Add highlight for metallic look
    context.fillStyle = 'rgba(255, 255, 255, 0.6)';
    context.beginPath();
    context.moveTo(118, 85);
    context.bezierCurveTo(115, 145, 115, 180, 118, 200);
    context.lineTo(125, 200);
    context.bezierCurveTo(122, 180, 122, 145, 125, 85);
    context.closePath();
    context.fill();
    
    // Add a bright yellow glow around the wrench for visibility
    context.globalCompositeOperation = 'destination-over';
    const glowGradient = context.createRadialGradient(128, 128, 50, 128, 128, 120);
    glowGradient.addColorStop(0, 'rgba(255, 217, 0, 0.46)'); // Gold glow
    glowGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
    context.fillStyle = glowGradient;
    context.fillRect(0, 0, 256, 256);
    
    // Add text indicator
    context.globalCompositeOperation = 'source-over';
    context.font = 'bold 20px Arial';
    context.fillStyle = '#FFA500'; // Orange text
    context.strokeStyle = '#000000';
    context.lineWidth = 2;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.strokeText('REPAIR', 128, 160);
    context.fillText('REPAIR', 128, 160);
    
    return new THREE.CanvasTexture(canvas);
}

export function createFuelCanTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ff0000';
    context.fillRect(0, 0, 128, 128);
    context.fillStyle = '#ffffff';
    context.font = 'bold 36px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('FUEL', 64, 64);
    context.fillStyle = '#000000';
    context.fillRect(90, 10, 20, 30);
    return new THREE.CanvasTexture(canvas);
}

export function createBillboardTexture(message) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;  // Higher resolution for better quality
    canvas.height = 512;
    const context = canvas.getContext('2d');
    
    // Fill with dark background for better contrast
    context.fillStyle = message.bgColor ?? '#000000';
    context.fillRect(0, 0, 1024, 512);
    
    // Add border
    context.strokeStyle = '#444444';
    context.lineWidth = 16;
    context.strokeRect(20, 20, 984, 472);
    
    // Create inner frame for more professional look
    context.strokeStyle = '#666666';
    context.lineWidth = 8;
    context.strokeRect(40, 40, 944, 432);

    // Check if the message is a string (for backward compatibility) or an object
    let messageType = 'text';
    let messageContent = message;
    
    if (typeof message === 'object') {
        messageType = message.type;
        messageContent = message.content;
    }
    
    // Handle image type
    if (messageType === 'image') {
        return new Promise((resolve) => {
            const img = new Image();
            
            // Don't use crossOrigin for local files
            if (messageContent.startsWith('http')) {
                img.crossOrigin = 'Anonymous';  // Only for remote URLs
            }
            
            img.onload = function() {
                try {
                    // Calculate aspect ratio to fit the image properly
                    const imgRatio = img.width / img.height;
                    let drawWidth = 864; // Max width (904 - 40 padding)
                    let drawHeight = drawWidth / imgRatio;
                    
                    // If too tall, scale by height instead
                    if (drawHeight > 372) { // Max height (392 - 20 padding)
                        drawHeight = 372;
                        drawWidth = drawHeight * imgRatio;
                    }
                    
                    // Center the image
                    const drawX = 512 - (drawWidth / 2);
                    const drawY = 256 - (drawHeight / 2);
                    
                    // Draw the image
                    context.drawImage(img, drawX, drawY, drawWidth, drawHeight);
                    
                    // Create texture with specific settings to avoid WebGL issues
                    const texture = new THREE.CanvasTexture(canvas);
                    texture.minFilter = THREE.LinearFilter;
                    texture.generateMipmaps = false;
                    
                    resolve(texture);
                } catch (error) {
                    console.error("Error creating billboard texture:", error);
                    
                    // Fallback to error text
                    context.fillStyle = '#ffffff';
                    context.font = 'bold 40px Arial';
                    context.textAlign = 'center';
                    context.textBaseline = 'middle';
                    context.fillText('Image Error: ' + error.message, 512, 256);
                    context.font = 'bold 30px Arial';
                    context.fillText('Path: ' + messageContent, 512, 320);
                    
                    const fallbackTexture = new THREE.CanvasTexture(canvas);
                    resolve(fallbackTexture);
                }
            };
            
            img.onerror = function(event) {
                console.error("Failed to load image:", messageContent, event);
                
                // More detailed error message
                context.fillStyle = '#ffffff';
                context.font = 'bold 40px Arial';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText('Image Loading Error', 512, 230);
                context.font = 'bold 30px Arial';
                context.fillText('Path: ' + messageContent, 512, 280);
                context.font = 'bold 20px Arial';
                context.fillText('Check the console for details', 512, 330);
                
                const fallbackTexture = new THREE.CanvasTexture(canvas);
                resolve(fallbackTexture);
            };
            
            // Add a timeout to prevent hanging if image never loads
            setTimeout(() => {
                if (!img.complete) {
                    img.src = ''; // Cancel the image load
                    
                    context.fillStyle = '#ffffff';
                    context.font = 'bold 40px Arial';
                    context.textAlign = 'center';
                    context.textBaseline = 'middle';
                    context.fillText('Image Load Timeout', 512, 256);
                    context.font = 'bold 30px Arial';
                    context.fillText('Path: ' + messageContent, 512, 320);
                    
                    const fallbackTexture = new THREE.CanvasTexture(canvas);
                    resolve(fallbackTexture);
                }
            }, 5000); // 5 second timeout
            
            img.src = messageContent;
        });
    }
    
    // Handle text type (original functionality)
    // Prepare text styling
    context.fillStyle = '#ffffff';  // Bright white text for contrast
    
    // Break the message into words for flexible layout
    const words = messageContent.split(' ');
    let lines = [];
    let currentLine = '';
    
    // First measure the text with a temporary font
    context.font = 'bold 70px Arial';
    
    // Calculate how many lines we need
    for (let i = 0; i < words.length; i++) {
        const testLine = currentLine + words[i] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > 900 && i > 0) {
            lines.push(currentLine.trim());
            currentLine = words[i] + ' ';
        } else {
            currentLine = testLine;
        }
    }
    lines.push(currentLine.trim()); // Add the last line
    
    // Choose font size based on number of lines and length of text
    let fontSize;
    if (lines.length === 1) {
        if (messageContent.length < 10) fontSize = 120;
        else if (messageContent.length < 15) fontSize = 100;
        else fontSize = 80;
    } else if (lines.length === 2) {
        fontSize = 70;
    } else if (lines.length === 3) {
        fontSize = 60;
    } else {
        fontSize = 50;
    }
    
    // If the text is all caps, reduce the font size slightly for better fit
    if (messageContent === messageContent.toUpperCase() && messageContent.length > 10) {
        fontSize = Math.max(40, fontSize - 10);
    }
    
    context.font = `bold ${fontSize}px Arial`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Recalculate lines with the actual font size
    lines = [];
    currentLine = '';
    
    for (let i = 0; i < words.length; i++) {
        const testLine = currentLine + words[i] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > 900 && i > 0) {
            lines.push(currentLine.trim());
            currentLine = words[i] + ' ';
        } else {
            currentLine = testLine;
        }
    }
    lines.push(currentLine.trim()); // Add the last line
    
    // Calculate the line height and total text height
    const lineHeight = fontSize * 1.2;
    const totalTextHeight = lineHeight * lines.length;
    
    // Calculate start Y position to center the text vertically
    const startY = 256 - (totalTextHeight / 2) + (lineHeight / 2);
    
    // Add slight shadow for better visibility
    context.shadowColor = 'rgba(0, 0, 0, 0.7)';
    context.shadowBlur = 10;
    context.shadowOffsetX = 4;
    context.shadowOffsetY = 4;
    
    // Draw each line
    for (let i = 0; i < lines.length; i++) {
        // Clip test to ensure it doesn't exceed boundaries
        context.save();
        context.beginPath();
        context.rect(60, 60, 904, 392);
        context.clip();
        
        context.fillText(lines[i], 512, startY + (i * lineHeight));
        context.restore();
    }
    
    return new THREE.CanvasTexture(canvas);
} 