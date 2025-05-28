/*
     node "C:\Users\tyrei\Downloads\Website Server\server.js"
*/




// Express.js server to handle file uploads and serve static files
const express = require('express');
// provides utilities for working with file and directory paths.
const path = require('path');
// enables Cross-Origin Resource Sharing (CORS) in Express.js applications -- same origin requests
const cors = require('cors');
// multer is a middleware for handling multipart/form-data, which is primarily used for uploading files. -- the file data
const multer = require('multer');
// fs is a built-in Node.js module that provides an API for interacting with the file system -- the file data - file stystem
const fs = require('fs');







// Set app to use express
const app = express();
// Set port to 5000
const PORT = 5000;





// Allow CORS for requests from any origin
app.use(cors());
// Parse JSON
app.use(express.json());
// Parse URL-encoded data
app.use(express.urlencoded({ extended: true }));































// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));


// Serve the index.html file on the root route
app.get('/', (req, res) => {

    res.sendFile(path.join(__dirname, 'public', 'index.html'));

});



































// Handle GET request to /files to return all files and folders in the upload directory
app.get('/files', (req, res) => {
    const uploadDir = path.join(__dirname, 'uploads');

    // Function to read directory contents recursively
    const readDirectory = (dir) => {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        const files = [];
        const folders = [];

        items.forEach(item => {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory()) {
                folders.push(item.name, readDirectory(fullPath));
            } else {
                files.push(item.name);
            }
        });

        return [files, folders];
    };

    // Read the contents of the upload directory
    try {
        const [files, folders ] = readDirectory(uploadDir);
        res.json([ files, folders ]);
    } catch (err) {
        console.error('Error reading directory:', err);
        res.status(500).send('Error reading directory');
    }
});

























// Handle GET request to /files/:fileName to return the content of a specific file
app.get('/download/:fileName', (req, res) => {
    const uploadDir = path.join(__dirname, 'uploads');
    const filePath = path.join(uploadDir, req.params.fileName);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).send('File not found');
    }

    // Set the appropriate headers to prompt a file download
    res.setHeader('Content-Disposition', `attachment; filename="${req.params.fileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    // Read the file content and send it as a response
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Error reading file');
        }

        res.send(data);
    });
});




























// Handle DELETE request to /delete/:fileName to delete a specific file
app.get('/delete/:fileName', (req, res) => {
    const uploadDir = path.join(__dirname, 'uploads');
    const filePath = path.join(uploadDir, req.params.fileName);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).send('File not found');
    }

    // Delete the file
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Error deleting file:', err);
            return res.status(500).send('Error deleting file');
        }

        res.status(200).send('File deleted successfully');
    });
});
































// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });





// Handle file uploads from /upload route
app.post('/upload', upload.array('files'), (req, res) => {
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No files uploaded');
    }

    // Store files to a variable mapping with name and buffer  -- a Buffer object that holds the raw binary data of the uploaded file.
                                                                //   This is because multer.memoryStorage() stores files in memory 
                                                                // instead of saving them directly to disk.
    const files = req.files.map(file => ({
        originalname: file.originalname,
        buffer: file.buffer
    }));


    // Save files to the "upload" directory
    const uploadDir = path.join(__dirname, 'uploads');


    // Check if the upload directory exists, if not, create it
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }


    // Save each file to the upload directory
    files.forEach(file => {
        // Check if file already exists, if so, rename it using filename(1).ext or more
        let filePath = path.join(uploadDir, file.originalname);
        let fileCount = 1;
        while (fs.existsSync(filePath)) {
            const parsedPath = path.parse(file.originalname);
            const newFileName = `${parsedPath.name}(${fileCount})${parsedPath.ext}`;
            filePath = path.join(uploadDir, newFileName);
            fileCount++;
        }
        fs.writeFileSync(filePath, file.buffer);
    });



    // Log the uploaded files and return sucess code
    console.log('Files saved to upload directory:', files.map(f => f.originalname));
    res.status(200).send('Files uploaded successfully');
});












































// Handle file uploads from /uploadFolder route
app.post('/uploadFolder', upload.array('files'), (req, res) => {
    const folderName = req.body.folderName;
    const files = req.files;
    console.log(folderName, files);

    // Check if folderName and files were provided
    if (!folderName || !files || files.length === 0) {
        return res.status(400).send('Folder name or files not provided');
    }

    // Create the folder directory
    const folderDir = path.join(__dirname, 'uploads', folderName);

    // Check if the folder directory exists, if not, create it
    if (!fs.existsSync(folderDir)) {
        fs.mkdirSync(folderDir, { recursive: true });
    }

    // Save each file to the folder directory
    files.forEach(file => {
        let filePath = path.join(folderDir, file.originalname);
        let fileCount = 1;
        while (fs.existsSync(filePath)) {
            const parsedPath = path.parse(file.originalname);
            const newFileName = `${parsedPath.name}(${fileCount})${parsedPath.ext}`;
            filePath = path.join(folderDir, newFileName);
            fileCount++;
        }
        fs.writeFileSync(filePath, file.buffer);
    });

    // Log the uploaded files and return success code
    console.log('Files saved to folder directory:', files.map(f => f.originalname));
    res.status(200).send('Files uploaded successfully');
});





































// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
