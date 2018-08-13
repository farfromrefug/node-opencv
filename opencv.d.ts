declare module "opencv" {
    class Matrix {
        constructor(height: number, width: number, channels?: number);
        release();
        mean(): number;
        width(): number;
        height(): number;
        channels(): number;
        toBufferAsync(
            callback: (err: Error, buffer: Buffer) => void,
            params?: {
                ext?: string;
            }
        );
        save(
            dest: string,
            callback: (err: Error) => void,
            params?: {
                ext?: string;
            }
        );
        saveAsync(
            dest: string,
            callback: (err: Error) => void,
            params?: {
                ext?: string;
            }
        );
        size():[number, number]
        toBuffer(params: { ext?: string });
        batchAdjust(params): {histo:{data:Matrix, mean:number}};
        put(buffer: Buffer);
        copy(): Matrix;
        clone(): Matrix;
        min(mat1: Matrix, mat2: Matrix): Matrix;
        max(mat1: Matrix, mat2: Matrix): Matrix;
        subtract(mat1: Matrix, mat2: Matrix): Matrix;
        resize(width: number, height: number): Matrix;
        divide(mat1: Matrix, mat2: Matrix, factor?: number): Matrix;
        convertTo(mat1: Matrix, type: number, factor?: number): Matrix;
        linePixels(x1, y1, x2, y2): (number[] | number)[];
    }
    function mean(mats: Matrix[], channels: number): Matrix;
    function readImageSync(buffer: Buffer): Matrix;
    function readImage(imgpath: string, callback: (err: Error, mat: Matrix) => void);
    namespace Constants {
        const CV_32FC1;
    }
}
