import { DirectUpload, type DirectUploadDelegate } from "@rails/activestorage";

// TODO: change to the production URL
const DIRECT_UPLOAD_URL = `${import.meta.env.VITE_API_URL}/rails/active_storage/direct_uploads`;

export function uploadFileToS3(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const delegate: DirectUploadDelegate = {
            directUploadWillCreateBlobWithXHR: (xhr: XMLHttpRequest) => {
                // send the httpOnly authToken cookie on this cross-origin XHR
                xhr.withCredentials = true
            },
            directUploadWillStoreFileWithXHR: (xhr: XMLHttpRequest) => {
                xhr.upload.addEventListener("progress", (_e: ProgressEvent) => {});
            },
        };

        const upload = new DirectUpload(file, DIRECT_UPLOAD_URL, delegate);
        upload.create((error, blob) => {
            if (error) reject(error);
            else resolve(blob.signed_id)
        });
    });
}

export function uploadMultipleFilesToS3(files: File[]): Promise<string[]> {
    return Promise.all(files.map(file => uploadFileToS3(file)))
}
