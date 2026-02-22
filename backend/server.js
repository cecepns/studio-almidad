const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100 // limit each IP to 100 requests per windowMs
// });
// app.use('/api', limiter);

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads-denko')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads-denko');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL database');
});

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Helper function to generate slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// =================== AUTH ROUTES ===================

// Admin login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const query = 'SELECT * FROM admin_users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const user = results[0];
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Verify token
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      email: req.user.email
    }
  });
});

// =================== PRODUCTS ROUTES ===================

// Get all products with pagination and search
app.get('/api/products', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const categoryId = req.query.category_id || '';
    const subcategoryId = req.query.subcategory_id || '';
    const offset = (page - 1) * limit;

    let whereClause = "WHERE p.status = 'active'";
    let queryParams = [];

    if (search) {
      whereClause += " AND (p.title LIKE ? OR p.description LIKE ? OR p.category LIKE ? OR c.name LIKE ? OR s.name LIKE ?)";
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (categoryId) {
      whereClause += " AND p.category_id = ?";
      queryParams.push(categoryId);
    }

    if (subcategoryId) {
      whereClause += " AND p.subcategory_id = ?";
      queryParams.push(subcategoryId);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id LEFT JOIN subcategories s ON p.subcategory_id = s.id ${whereClause}`;
    db.query(countQuery, queryParams, (err, countResult) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      const totalItems = countResult[0].total;
      const totalPages = Math.ceil(totalItems / limit);

      // Get products
      const query = `
        SELECT p.id, p.title, p.slug, p.description, p.image, p.category, 
               p.category_id, p.subcategory_id,
               c.name as category_name, s.name as subcategory_name,
               p.created_at, p.updated_at
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN subcategories s ON p.subcategory_id = s.id
        ${whereClause}
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      db.query(query, [...queryParams, limit, offset], (err, results) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Database error' });
        }

        res.json({
          success: true,
          data: results,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            limit
          }
        });
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get product by slug
app.get('/api/products/:slug', (req, res) => {
  try {
    const { slug } = req.params;

    const query = `
      SELECT p.id, p.title, p.slug, p.description, p.image, p.category,
             p.category_id, p.subcategory_id,
             c.name as category_name, s.name as subcategory_name,
             p.created_at, p.updated_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories s ON p.subcategory_id = s.id
      WHERE p.slug = ? AND p.status = 'active'
    `;
    
    db.query(query, [slug], (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      res.json({
        success: true,
        data: results[0]
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create product (Admin only)
app.post('/api/products', authenticateToken, (req, res) => {
  try {
    const { title, description, image, category, category_id, subcategory_id } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description required' });
    }

    const slug = generateSlug(title);

    const query = `
      INSERT INTO products (title, slug, description, image, category, category_id, subcategory_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(query, [title, slug, description, image, category || null, category_id || null, subcategory_id || null], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ success: false, message: 'Product with this title already exists' });
        }
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: {
          id: result.insertId,
          title,
          slug,
          description,
          image,
          category,
          category_id: category_id || null,
          subcategory_id: subcategory_id || null
        }
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update product (Admin only)
app.put('/api/products/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image, category, category_id, subcategory_id } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description required' });
    }

    const slug = generateSlug(title);

    const query = `
      UPDATE products
      SET title = ?, slug = ?, description = ?, image = ?, category = ?, 
          category_id = ?, subcategory_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    db.query(query, [title, slug, description, image, category || null, category_id || null, subcategory_id || null, id], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ success: false, message: 'Product with this title already exists' });
        }
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      res.json({
        success: true,
        message: 'Product updated successfully'
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete product (Admin only)
app.delete('/api/products/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM products WHERE id = ?';
    
    db.query(query, [id], (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =================== BANNERS ROUTES ===================

// Get all banners
app.get('/api/banners', (req, res) => {
  try {
    const query = `
      SELECT id, title, description, image, link, order_index
      FROM banners
      WHERE status = 'active'
      ORDER BY order_index ASC
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      res.json({
        success: true,
        data: results
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create banner (Admin only)
app.post('/api/banners', authenticateToken, (req, res) => {
  try {
    const { title, description, image, link, order_index } = req.body;

    if (!image) {
      return res.status(400).json({ success: false, message: 'Image is required' });
    }

    const query = `
      INSERT INTO banners (title, description, image, link, order_index)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    db.query(query, [title || null, description || null, image, link || null, order_index || 0], (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      res.status(201).json({
        success: true,
        message: 'Banner created successfully',
        data: {
          id: result.insertId,
          title: title || null,
          description: description || null,
          image,
          link: link || null,
          order_index: order_index || 0
        }
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update banner (Admin only)
app.put('/api/banners/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image, link, order_index } = req.body;

    // First, get the existing banner to preserve image if not provided
    const getQuery = 'SELECT image FROM banners WHERE id = ?';
    
    db.query(getQuery, [id], (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ success: false, message: 'Banner not found' });
      }

      // Use provided image or keep existing image
      const imageToUpdate = image || results[0].image;

      const updateQuery = `
        UPDATE banners
        SET title = ?, description = ?, image = ?, link = ?, order_index = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.query(updateQuery, [title || null, description || null, imageToUpdate, link || null, order_index || 0, id], (err, result) => {
        if (err) {
          console.error('Update banner error:', err);
          return res.status(500).json({ success: false, message: 'Database error', error: err.message });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Banner not found' });
        }

        res.json({
          success: true,
          message: 'Banner updated successfully'
        });
      });
    });
  } catch (error) {
    console.error('Update banner error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Delete banner (Admin only)
app.delete('/api/banners/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM banners WHERE id = ?';
    
    db.query(query, [id], (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Banner not found' });
      }

      res.json({
        success: true,
        message: 'Banner deleted successfully'
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =================== SETTINGS ROUTES ===================

// Get all settings
app.get('/api/settings', (req, res) => {
  try {
    const query = 'SELECT setting_key, setting_value FROM settings';
    
    db.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      const settings = {};
      results.forEach(row => {
        settings[row.setting_key] = row.setting_value;
      });

      res.json({
        success: true,
        data: settings
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update settings (Admin only)
app.put('/api/settings', authenticateToken, (req, res) => {
  try {
    const settings = req.body;

    if (!settings || Object.keys(settings).length === 0) {
      return res.status(400).json({ success: false, message: 'Settings data required' });
    }

    // First, load existing settings so we can clean up old assets (e.g. images)
    const getExistingSettings = () => {
      return new Promise((resolve, reject) => {
        const query = 'SELECT setting_key, setting_value FROM settings';
        db.query(query, (err, results) => {
          if (err) return reject(err);

          const existing = {};
          results.forEach(row => {
            existing[row.setting_key] = row.setting_value;
          });

          resolve(existing);
        });
      });
    };

    getExistingSettings()
      .then((existingSettings) => {
        const queries = Object.entries(settings).map(([key, value]) => {
          return new Promise((resolve, reject) => {
            const query = `
          INSERT INTO settings (setting_key, setting_value) 
          VALUES (?, ?) 
          ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = CURRENT_TIMESTAMP
        `;
            
            db.query(query, [key, value], (err, result) => {
              if (err) return reject(err);

              // If this setting stores an image path and it changed, try to delete the old file
              if (key.endsWith('_image')) {
                const oldValue = existingSettings[key];
                if (oldValue && oldValue !== value) {
                  try {
                    // oldValue is stored like "/uploads/filename.jpg" or "uploads/filename.jpg"
                    const relativePath = oldValue.replace(/^\/+uploads\/?/, '').replace(/^uploads\/?/, '');
                    const oldFilePath = path.join(uploadsDir, relativePath);
                    fs.unlink(oldFilePath, (unlinkErr) => {
                      if (unlinkErr && unlinkErr.code !== 'ENOENT') {
                        console.error('Error deleting old settings image:', unlinkErr);
                      }
                    });
                  } catch (cleanupErr) {
                    console.error('Error while cleaning up old settings image:', cleanupErr);
                  }
                }
              }

              resolve(result);
            });
          });
        });

        return Promise.all(queries);
      })
      .then(() => {
        res.json({
          success: true,
          message: 'Settings updated successfully'
        });
      })
      .catch((err) => {
        console.error('Error updating settings:', err);
        res.status(500).json({ success: false, message: 'Database error' });
      });
  } catch (error) {
    console.error('Server error in /api/settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =================== UPLOAD ROUTES ===================

// Upload single image
app.post('/api/upload/image', authenticateToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        filename: req.file.filename,
        url: imageUrl
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Upload error' });
  }
});

// Upload image for Quill editor
app.post('/api/upload/quill-image', authenticateToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;

    res.json({
      success: true,
      url: imageUrl
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Upload error' });
  }
});

// =================== ADMIN DASHBOARD ROUTES ===================

// Get dashboard statistics (Admin only)
app.get('/api/admin/dashboard', authenticateToken, (req, res) => {
  try {
    const queries = {
      totalProducts: 'SELECT COUNT(*) as count FROM products WHERE status = "active"',
      totalBanners: 'SELECT COUNT(*) as count FROM banners WHERE status = "active"',
      recentProducts: 'SELECT id, title, created_at FROM products WHERE status = "active" ORDER BY created_at DESC LIMIT 5'
    };

    const promises = Object.entries(queries).map(([key, query]) => {
      return new Promise((resolve, reject) => {
        db.query(query, (err, result) => {
          if (err) reject(err);
          else resolve([key, result]);
        });
      });
    });

    Promise.all(promises)
      .then(results => {
        const stats = {};
        results.forEach(([key, result]) => {
          stats[key] = result;
        });

        res.json({
          success: true,
          data: {
            totalProducts: stats.totalProducts[0].count,
            totalBanners: stats.totalBanners[0].count,
            recentProducts: stats.recentProducts
          }
        });
      })
      .catch(err => {
        res.status(500).json({ success: false, message: 'Database error' });
      });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all products for admin (with inactive)
app.get('/api/admin/products', authenticateToken, (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    let queryParams = [];

    if (search) {
      whereClause += " AND (p.title LIKE ? OR p.description LIKE ? OR p.category LIKE ? OR c.name LIKE ? OR s.name LIKE ?)";
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id LEFT JOIN subcategories s ON p.subcategory_id = s.id ${whereClause}`;
    db.query(countQuery, queryParams, (err, countResult) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      const totalItems = countResult[0].total;
      const totalPages = Math.ceil(totalItems / limit);

      // Get products
      const query = `
        SELECT p.id, p.title, p.slug, p.description, p.image, p.category, p.status,
               p.category_id, p.subcategory_id,
               c.name as category_name, s.name as subcategory_name,
               p.created_at, p.updated_at
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN subcategories s ON p.subcategory_id = s.id
        ${whereClause}
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      db.query(query, [...queryParams, limit, offset], (err, results) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Database error' });
        }

        res.json({
          success: true,
          data: results,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            limit
          }
        });
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all banners for admin (with inactive)
app.get('/api/admin/banners', authenticateToken, (req, res) => {
  try {
    const query = `
      SELECT id, title, description, image, link, order_index, status, created_at, updated_at
      FROM banners
      ORDER BY order_index ASC
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      res.json({
        success: true,
        data: results
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =================== CATEGORIES ROUTES ===================

// Get all categories
app.get('/api/categories', (req, res) => {
  try {
    const query = `
      SELECT id, name, slug, description, status, created_at, updated_at
      FROM categories
      WHERE status = 'active'
      ORDER BY name ASC
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      res.json({
        success: true,
        data: results
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all categories for admin (with inactive)
app.get('/api/admin/categories', authenticateToken, (req, res) => {
  try {
    const query = `
      SELECT id, name, slug, description, status, created_at, updated_at
      FROM categories
      ORDER BY name ASC
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      res.json({
        success: true,
        data: results
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create category (Admin only)
app.post('/api/admin/categories', authenticateToken, (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name required' });
    }

    const slug = generateSlug(name);

    const query = `
      INSERT INTO categories (name, slug, description)
      VALUES (?, ?, ?)
    `;
    
    db.query(query, [name, slug, description || null], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ success: false, message: 'Category with this name already exists' });
        }
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: {
          id: result.insertId,
          name,
          slug,
          description
        }
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update category (Admin only)
app.put('/api/admin/categories/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name required' });
    }

    const slug = generateSlug(name);

    const query = `
      UPDATE categories
      SET name = ?, slug = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    db.query(query, [name, slug, description || null, status || 'active', id], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ success: false, message: 'Category with this name already exists' });
        }
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }

      res.json({
        success: true,
        message: 'Category updated successfully'
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete category (Admin only)
app.delete('/api/admin/categories/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM categories WHERE id = ?';
    
    db.query(query, [id], (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =================== SUBCATEGORIES ROUTES ===================

// Get subcategories by category
app.get('/api/subcategories/:categoryId', (req, res) => {
  try {
    const { categoryId } = req.params;

    const query = `
      SELECT id, category_id, name, slug, description, status, created_at, updated_at
      FROM subcategories
      WHERE category_id = ? AND status = 'active'
      ORDER BY name ASC
    `;
    
    db.query(query, [categoryId], (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      res.json({
        success: true,
        data: results
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all subcategories for admin
app.get('/api/admin/subcategories', authenticateToken, (req, res) => {
  try {
    const categoryId = req.query.category_id;

    let query = `
      SELECT s.id, s.category_id, s.name, s.slug, s.description, s.status, 
             s.created_at, s.updated_at, c.name as category_name
      FROM subcategories s
      LEFT JOIN categories c ON s.category_id = c.id
    `;
    let queryParams = [];

    if (categoryId) {
      query += ' WHERE s.category_id = ?';
      queryParams.push(categoryId);
    }

    query += ' ORDER BY c.name ASC, s.name ASC';
    
    db.query(query, queryParams, (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      res.json({
        success: true,
        data: results
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create subcategory (Admin only)
app.post('/api/admin/subcategories', authenticateToken, (req, res) => {
  try {
    const { category_id, name, description } = req.body;

    if (!category_id || !name) {
      return res.status(400).json({ success: false, message: 'Category ID and subcategory name required' });
    }

    const slug = generateSlug(name);

    const query = `
      INSERT INTO subcategories (category_id, name, slug, description)
      VALUES (?, ?, ?, ?)
    `;
    
    db.query(query, [category_id, name, slug, description || null], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ success: false, message: 'Subcategory with this name already exists in this category' });
        }
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      res.status(201).json({
        success: true,
        message: 'Subcategory created successfully',
        data: {
          id: result.insertId,
          category_id,
          name,
          slug,
          description
        }
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update subcategory (Admin only)
app.put('/api/admin/subcategories/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, name, description, status } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Subcategory name required' });
    }

    const slug = generateSlug(name);

    const query = `
      UPDATE subcategories
      SET category_id = ?, name = ?, slug = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    db.query(query, [category_id, name, slug, description || null, status || 'active', id], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ success: false, message: 'Subcategory with this name already exists in this category' });
        }
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Subcategory not found' });
      }

      res.json({
        success: true,
        message: 'Subcategory updated successfully'
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete subcategory (Admin only)
app.delete('/api/admin/subcategories/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM subcategories WHERE id = ?';
    
    db.query(query, [id], (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Subcategory not found' });
      }

      res.json({
        success: true,
        message: 'Subcategory deleted successfully'
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File too large' });
  }
  
  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({ success: false, message: 'Only image files are allowed' });
  }

  res.status(500).json({ success: false, message: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Upload directory: ${uploadsDir}`);
});

module.exports = app;