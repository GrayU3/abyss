/**
 * ==================================
 * Image Loading Utilities
 * ==================================
 */

/**
 * Loads a single image asynchronously with options.
 * @param {string} src - The source URL of the image.
 * @param {object} [options] - Optional configuration.
 * @param {number} [options.timeout=0] - Timeout in milliseconds (0 for no timeout).
 * @param {string} [options.crossOrigin] - Value for the image's crossOrigin attribute (e.g., 'anonymous').
 * @returns {Promise<HTMLImageElement>} A promise that resolves with the loaded Image object or rejects on error/timeout.
 */
const loadImage = (src, options = {}) => {
    return new Promise((resolve, reject) => {
        let timerId = null;
        const img = new Image();

        const cleanup = () => {
            if (timerId) {
                clearTimeout(timerId);
                timerId = null;
            }
            img.onload = null;
            img.onerror = null;
            img.onabort = null; // Also handle abort
        };

        img.onload = () => {
            cleanup();
            resolve(img);
        };

        img.onerror = (err) => {
            cleanup();
            // Provide more context in the error message
            reject(new Error(`Failed to load image: ${src}. Reason: ${err.type || 'Unknown error'}`));
        };

        img.onabort = () => {
            cleanup();
            reject(new Error(`Image loading aborted: ${src}`));
        };

        // Apply options
        if (options.crossOrigin) {
            img.crossOrigin = options.crossOrigin;
        }

        // Set up timeout if specified
        if (options.timeout && options.timeout > 0) {
            timerId = setTimeout(() => {
                cleanup();
                // Set src to empty string to try and cancel the download
                img.src = "";
                reject(new Error(`Image loading timed out after ${options.timeout}ms: ${src}`));
            }, options.timeout);
        }

        // Start loading
        img.src = src;
    });
};

/**
 * Loads multiple images concurrently.
 * @param {string[]} srcs - An array of image source URLs.
 * @param {object} [options] - Optional configuration passed to each loadImage call (timeout, crossOrigin).
 * @param {function(number):void} [onProgress] - Optional callback function reporting progress (0.0 to 1.0).
 * @returns {Promise<HTMLImageElement[]>} A promise that resolves with an array of loaded Image objects (in the same order as srcs) or rejects if any image fails.
 */
const loadImages = (srcs, options = {}, onProgress = null) => {
    let loadedCount = 0;
    const totalCount = srcs.length;

    const promises = srcs.map(src =>
        loadImage(src, options)
        .then(img => {
            loadedCount++;
            if (onProgress) {
                onProgress(loadedCount / totalCount);
            }
            return img;
        })
    );

    // Use Promise.all to wait for all images to load
    // It will reject immediately if any promise in the array rejects.
    return Promise.all(promises);
};


/**
 * ==================================
 * Collision Detection Utilities
 * ==================================
 */

/**
 * Represents a 2D Rectangle.
 * @typedef {object} Rect
 * @property {number} x - The x-coordinate of the top-left corner.
 * @property {number} y - The y-coordinate of the top-left corner.
 * @property {number} width - The width of the rectangle.
 * @property {number} height - The height of the rectangle.
 */

/**
 * Represents a 2D Circle.
 * @typedef {object} Circle
 * @property {number} x - The x-coordinate of the center.
 * @property {number} y - The y-coordinate of the center.
 * @property {number} radius - The radius of the circle.
 */

/**
 * Represents a 2D Point.
 * @typedef {object} Point
 * @property {number} x - The x-coordinate.
 * @property {number} y - The y-coordinate.
 */

/**
 * Represents detailed collision information.
 * @typedef {object} CollisionResult
 * @property {boolean} collided - True if a collision occurred.
 * @property {'top'|'bottom'|'left'|'right'|null} direction - The primary direction of collision from object1's perspective (based on minimum overlap). Null if no collision.
 * @property {number} overlapX - The amount of overlap on the X-axis.
 * @property {number} overlapY - The amount of overlap on the Y-axis.
 * @property {Rect} intersection - The rectangle representing the overlapping area. Null if no collision.
 */


/**
 * Checks for Axis-Aligned Bounding Box (AABB) collision between two rectangular objects.
 * Assumes objects have { x, y, width, height } properties.
 * @param {Rect} rect1 - The first rectangle.
 * @param {Rect} rect2 - The second rectangle.
 * @returns {boolean} True if the rectangles collide, false otherwise.
 */
function isCollidingAABB(rect1, rect2) {
    if (!rect1 || !rect2) return false; // Basic validation
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

/**
 * Checks for collision between two objects using their 'hitbox' property (assumed to be a Rect).
 * Provides detailed collision information including direction and overlap.
 * **Correction**: This version consistently uses the `hitbox` property for all calculations, fixing the inconsistency in the original code.
 * @param {object} object1 - The first object, must have a `hitbox` property of type Rect.
 * @param {object} object2 - The second object, must have a `hitbox` property of type Rect.
 * @returns {CollisionResult | null} Detailed collision result object if collision occurs, otherwise null.
 */
function checkCollision(object1, object2) {
    if (!object1?.hitbox || !object2?.hitbox) {
        console.warn("checkCollision requires both objects to have a 'hitbox' property.");
        return null;
    }

    const box1 = object1.hitbox;
    const box2 = object2.hitbox;

    const isColliding =
        box1.x < box2.x + box2.width &&
        box1.x + box1.width > box2.x &&
        box1.y < box2.y + box2.height &&
        box1.y + box1.height > box2.y;

    if (!isColliding) {
        return null; // No collision
    }

    // Calculate overlaps
    const xOverlap = Math.min(
        box1.x + box1.width - box2.x,  // Right edge of 1 vs left edge of 2
        box2.x + box2.width - box1.x   // Right edge of 2 vs left edge of 1
    );
    const yOverlap = Math.min(
        box1.y + box1.height - box2.y, // Bottom edge of 1 vs top edge of 2
        box2.y + box2.height - box1.y  // Bottom edge of 2 vs top edge of 1
    );

    // Determine collision direction based on minimum penetration
    let direction = null;
    if (xOverlap < yOverlap) {
        direction = box1.x + box1.width / 2 < box2.x + box2.width / 2 ? 'right' : 'left'; // Collision is on the right/left side of object1
    } else {
        direction = box1.y + box1.height / 2 < box2.y + box2.height / 2 ? 'bottom' : 'top'; // Collision is on the bottom/top side of object1
    }

    // Calculate intersection rectangle
    const intersectionX = Math.max(box1.x, box2.x);
    const intersectionY = Math.max(box1.y, box2.y);
    const intersectionWidth = Math.min(box1.x + box1.width, box2.x + box2.width) - intersectionX;
    const intersectionHeight = Math.min(box1.y + box1.height, box2.y + box2.height) - intersectionY;

    return {
        collided: true,
        direction: direction,
        overlapX: xOverlap,
        overlapY: yOverlap,
        intersection: {
            x: intersectionX,
            y: intersectionY,
            width: intersectionWidth,
            height: intersectionHeight,
        },
    };
}

/**
 * Checks for collision between two circles.
 * @param {Circle} circle1 - The first circle.
 * @param {Circle} circle2 - The second circle.
 * @returns {boolean} True if the circles collide, false otherwise.
 */
function isCollidingCircles(circle1, circle2) {
    if (!circle1 || !circle2) return false;
    const dx = circle1.x - circle2.x;
    const dy = circle1.y - circle2.y;
    const distanceSquared = dx * dx + dy * dy;
    const radiusSum = circle1.radius + circle2.radius;
    return distanceSquared < radiusSum * radiusSum;
}

/**
 * Checks if a point is inside a rectangle.
 * @param {Point} point - The point to check.
 * @param {Rect} rect - The rectangle.
 * @returns {boolean} True if the point is inside the rectangle, false otherwise.
 */
function isPointInRect(point, rect) {
    if (!point || !rect) return false;
    return (
        point.x >= rect.x &&
        point.x < rect.x + rect.width && // Use < for width/height if exclusive boundary is desired
        point.y >= rect.y &&
        point.y < rect.y + rect.height
    );
}

/**
 * Checks for collision between a circle and a rectangle.
 * @param {Circle} circle - The circle.
 * @param {Rect} rect - The rectangle.
 * @returns {boolean} True if they collide, false otherwise.
 */
function isCollidingCircleRect(circle, rect) {
    if (!circle || !rect) return false;

    // Find the closest point on the rectangle to the center of the circle
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

    // Calculate the distance between the circle's center and this closest point
    const dx = circle.x - closestX;
    const dy = circle.y - closestY;
    const distanceSquared = dx * dx + dy * dy;

    // If the distance is less than the square of the circle's radius, an overlap occurs
    return distanceSquared < circle.radius * circle.radius;
}


/**
 * ==================================
 * Geometric / Math Utilities
 * ==================================
 */

/**
 * Calculates the Euclidean distance between two points.
 * @param {Point} p1 - The first point {x, y}.
 * @param {Point} p2 - The second point {x, y}.
 * @returns {number} The distance between the points.
 */
function distance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Clamps a value between a minimum and maximum value.
 * @param {number} value - The value to clamp.
 * @param {number} min - The minimum allowed value.
 * @param {number} max - The maximum allowed value.
 * @returns {number} The clamped value.
 */
function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}

/**
 * Linearly interpolates between two values.
 * @param {number} a - The start value.
 * @param {number} b - The end value.
 * @param {number} t - The interpolation factor (usually between 0.0 and 1.0).
 * @returns {number} The interpolated value.
 */
function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Generates a random integer between min (inclusive) and max (exclusive).
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value (exclusive).
 * @returns {number} A random integer.
 */
function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

/**
 * Generates a random floating-point number between min (inclusive) and max (exclusive).
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value (exclusive).
 * @returns {number} A random float.
 */
function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}


/**
 * ==================================
 * General Utilities
 * ==================================
 */

/**
 * Debounce function: Ensures a function is not called again until a certain amount of time has passed without it being called.
 * Useful for rate-limiting events like window resizing or search input.
 * @param {function} func - The function to debounce.
 * @param {number} wait - The debounce time in milliseconds.
 * @param {boolean} [immediate=false] - If true, trigger the function on the leading edge instead of the trailing edge.
 * @returns {function} The debounced function.
 */
function debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
        const context = this;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

/**
 * Throttle function: Ensures a function is called at most once within a specified time period.
 * Useful for rate-limiting events like scrolling or mouse movement.
 * @param {function} func - The function to throttle.
 * @param {number} limit - The throttle time in milliseconds.
 * @returns {function} The throttled function.
 */
function throttle(func, limit) {
    let inThrottle;
    let lastResult;
    return function executedFunction(...args) {
        const context = this;
        if (!inThrottle) {
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
            lastResult = func.apply(context, args);
        }
        return lastResult;
    };
}


// ================= Example Usage =================

// --- Image Loading ---
/*
const imageUrls = [
    'path/to/image1.png',
    'path/to/image2.jpg',
    'invalid/path/image3.gif' // Example of a failing image
];

console.log('Loading multiple images...');
loadImages(imageUrls, { timeout: 5000, crossOrigin: 'anonymous' }, (progress) => {
        console.log(`Image loading progress: ${(progress * 100).toFixed(0)}%`);
    })
    .then(loadedImages => {
        console.log('All images loaded successfully:', loadedImages);
        // Now you can use the loadedImages array (contains HTMLImageElement objects)
        // e.g., draw them on a canvas
    })
    .catch(error => {
        console.error('Error loading one or more images:', error);
    });

// Load single image
loadImage('path/to/player.png', { timeout: 2000 })
    .then(playerImg => {
        console.log('Player image loaded:', playerImg);
    })
    .catch(error => {
        console.error(error);
    });
*/

// --- Collision Detection ---
/*
const player = {
    id: 'player',
    // x: 50, y: 50, width: 32, height: 32, // Main position/size (optional)
    hitbox: { x: 50, y: 50, width: 30, height: 30 } // Hitbox used for collision
};

const wall = {
    id: 'wall',
    // x: 70, y: 60, width: 50, height: 50,
    hitbox: { x: 70, y: 60, width: 50, height: 50 }
};

const enemy = {
    id: 'enemy',
    hitbox: { x: 200, y: 200, width: 25, height: 25 }
}

const collisionResultPlayerWall = checkCollision(player, wall);
if (collisionResultPlayerWall) {
    console.log('Player collided with wall:', collisionResultPlayerWall);
    // Example: Prevent movement based on collision direction
    // if (collisionResultPlayerWall.direction === 'right') { player.x -= collisionResultPlayerWall.overlapX; }
    // ... etc.
} else {
    console.log('Player and wall: No collision.');
}

const collisionResultPlayerEnemy = checkCollision(player, enemy);
if (collisionResultPlayerEnemy) {
    console.log('Player collided with enemy:', collisionResultPlayerEnemy);
} else {
    console.log('Player and enemy: No collision.');
}

// Other collision checks
const circle1 = { x: 100, y: 100, radius: 20 };
const circle2 = { x: 130, y: 100, radius: 15 }; // Should collide
const circle3 = { x: 200, y: 200, radius: 10 }; // Should not collide with circle1

console.log("Circle 1 vs Circle 2:", isCollidingCircles(circle1, circle2)); // true
console.log("Circle 1 vs Circle 3:", isCollidingCircles(circle1, circle3)); // false

const point = { x: 75, y: 65 };
const rect = { x: 70, y: 60, width: 50, height: 50 };
console.log("Point in Rect:", isPointInRect(point, rect)); // true
console.log("Point in Rect (outside):", isPointInRect({ x: 10, y: 10 }, rect)); // false

console.log("Circle vs Rect:", isCollidingCircleRect(circle1, rect)); // true (assuming proximity)
console.log("Circle vs Rect (far):", isCollidingCircleRect(circle3, rect)); // false

*/
