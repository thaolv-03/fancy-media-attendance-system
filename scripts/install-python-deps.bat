@echo off
echo Installing Python dependencies for Facenet512...
echo.

cd python

echo Installing deepface...
pip install deepface>=0.0.93

echo Installing opencv-python...
pip install opencv-python>=4.8.0

echo Installing numpy...
pip install numpy>=1.24.0

echo Installing Pillow...
pip install Pillow>=10.0.0

echo Installing tensorflow...
pip install tensorflow>=2.13.0

echo.
echo Python dependencies installed successfully!
echo You can now use Facenet512 with 512-dim embeddings.
echo.

cd ..
pause
