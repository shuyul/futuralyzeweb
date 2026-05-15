/**
 * 图片压缩工具
 * 在上传前压缩图片，提升上传速度
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  maxSizeMB?: number;
}

/**
 * 压缩图片文件
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.8,
    maxSizeMB = 2,
  } = options;

  // 如果文件已经很小，直接返回
  const fileSizeMB = file.size / 1024 / 1024;
  if (fileSizeMB < 0.5) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // 计算新的尺寸
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        // 创建 canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('无法创建 canvas context'));
          return;
        }

        // 绘制图片
        ctx.drawImage(img, 0, 0, width, height);

        // 转换为 blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('图片压缩失败'));
              return;
            }

            // 创建新的 File 对象
            const compressedFile = new File([blob], file.name, {
              type: file.type || 'image/jpeg',
              lastModified: Date.now(),
            });

            // 检查压缩后的大小
            const compressedSizeMB = compressedFile.size / 1024 / 1024;

            if (compressedSizeMB > maxSizeMB && quality > 0.3) {
              // 如果还是太大，用更低的质量再压缩一次
              compressImage(file, {
                ...options,
                quality: quality * 0.7,
              }).then(resolve).catch(reject);
            } else {
              resolve(compressedFile);
            }
          },
          file.type || 'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('图片加载失败'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * 获取图片信息（不压缩）
 */
export async function getImageInfo(file: File): Promise<{
  width: number;
  height: number;
  sizeMB: number;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          sizeMB: file.size / 1024 / 1024,
        });
      };

      img.onerror = () => {
        reject(new Error('图片加载失败'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };

    reader.readAsDataURL(file);
  });
}
